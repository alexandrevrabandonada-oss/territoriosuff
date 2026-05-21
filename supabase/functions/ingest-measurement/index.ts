import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.6";

const MAX_FUTURE_MS = 10 * 60 * 1000;
const MAX_PAST_MS = 7 * 24 * 60 * 60 * 1000;

type IngestPayload = {
  station_code?: unknown;
  ts?: unknown;
  pm25?: unknown;
  pm10?: unknown;
  temp?: unknown;
  humidity?: unknown;
  quality_flag?: unknown;
  battery_v?: unknown;
  rssi?: unknown;
  firmware?: unknown;
  device_temp?: unknown;
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function parseBearer(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function isValidIsoTimestamp(value: string): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString() === value;
}

function isQuiet(start: string, end: string): boolean {
  if (!start || !end) return false;
  // Use UTC or fixed offset? For SEMEAR, we assume the user's intent matches the server's processed time 
  // or that quiet hours are "generic". Here we'll use the server's current time (UTC).
  const now = new Date();
  const currentStr = now.getUTCHours().toString().padStart(2, '0') + ':' + now.getUTCMinutes().toString().padStart(2, '0');

  if (start <= end) {
    return currentStr >= start && currentStr <= end;
  } else {
    // Spans midnight (e.g. 22:00 to 07:00)
    return currentStr >= start || currentStr <= end;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "method_not_allowed" });
  }

  const ingestApiKey = Deno.env.get("INGEST_API_KEY");
  if (!ingestApiKey) {
    return json(500, { ok: false, error: "missing_ingest_api_key" });
  }

  const token = parseBearer(req.headers.get("authorization"));
  if (!token || token !== ingestApiKey) {
    return json(401, { ok: false, error: "unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: "missing_supabase_secrets" });
  }

  let payload: IngestPayload;
  try {
    payload = (await req.json()) as IngestPayload;
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const stationCode = typeof payload.station_code === "string" ? payload.station_code.trim() : "";
  if (!stationCode) {
    return json(400, { ok: false, error: "station_code_required" });
  }

  const ts = typeof payload.ts === "string" ? payload.ts : "";
  if (!ts || !isValidIsoTimestamp(ts)) {
    return json(400, { ok: false, error: "invalid_ts" });
  }

  const now = Date.now();
  const tsMs = new Date(ts).getTime();
  if (tsMs - now > MAX_FUTURE_MS) {
    return json(400, { ok: false, error: "ts_too_far_in_future" });
  }
  if (now - tsMs > MAX_PAST_MS) {
    return json(400, { ok: false, error: "ts_too_old" });
  }

  const pm25 = toNumberOrNull(payload.pm25);
  const pm10 = toNumberOrNull(payload.pm10);
  const temp = toNumberOrNull(payload.temp);
  const humidity = toNumberOrNull(payload.humidity);
  const qualityFlag = payload.quality_flag ?? null;
  const batteryV = toNumberOrNull(payload.battery_v);
  const rssi = toNumberOrNull(payload.rssi);
  const firmware = typeof payload.firmware === "string" ? payload.firmware.trim() : null;
  const deviceTemp = toNumberOrNull(payload.device_temp);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: station, error: stationError } = await supabase
    .from("stations")
    .select("id, name, code")
    .eq("code", stationCode)
    .maybeSingle();

  if (stationError) {
    return json(500, { ok: false, error: "station_lookup_failed" });
  }
  if (!station?.id) {
    return json(404, { ok: false, error: "station_not_found" });
  }

  const { error: insertError, data: insertData } = await supabase
    .from("measurements")
    .upsert(
      {
        station_id: station.id,
        ts,
        pm25,
        pm10,
        temp,
        humidity,
        quality_flag: qualityFlag
      },
      { onConflict: "station_id,ts", ignoreDuplicates: true }
    )
    .select();

  if (insertError) {
    // Log failure
    await supabase.from("ingest_logs").insert({
      station_code: stationCode,
      pm25,
      pm10,
      battery_v: batteryV,
      rssi,
      firmware,
      device_temp: deviceTemp,
      inserted: false,
      duplicated: false,
      error_reason: insertError.message
    }).catch(() => {});

    return json(500, { ok: false, error: "measurement_insert_failed" });
  }

  const wasInserted = (insertData || []).length > 0;
  const wasDuplicated = !wasInserted;

  const { error: updateError } = await supabase
    .from("stations")
    .update({ last_seen_at: new Date().toISOString(), status: "online" })
    .eq("id", station.id);

  if (updateError) {
    // Log but don't fail - station update is secondary
    console.error(`Failed to update station ${station.id}:`, updateError.message);
  }

  // Log to ingest_logs
  await supabase.from("ingest_logs").insert({
    station_code: stationCode,
    pm25,
    pm10,
    battery_v: batteryV,
    rssi,
    firmware,
    device_temp: deviceTemp,
    inserted: wasInserted,
    duplicated: wasDuplicated,
    error_reason: null
  }).catch(() => {});

  // --- Advanced Push Notification Alerts ---
  try {
    const { data: subs, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("is_active", true);

    if (subError) throw subError;

    const eligibleSubs = (subs || []).filter(sub => {
      // 1. Station Filter
      if (sub.station_code_filter && sub.station_code_filter !== stationCode) return false;

      // 2. Quiet Hours check
      if (isQuiet(sub.quiet_start, sub.quiet_end)) return false;

      // 3. Cooldown check
      if (sub.last_alert_at) {
        const lastAlert = new Date(sub.last_alert_at).getTime();
        const cooldownMs = (sub.cooldown_minutes || 120) * 60 * 1000;
        if (Date.now() - lastAlert < cooldownMs) return false;
      }

      // 4. Threshold trigger (PM2.5 or PM10)
      const pm25Trigger = pm25 !== null && pm25 >= (sub.pm25_threshold || 35);
      const pm10Trigger = pm10 !== null && sub.pm10_threshold !== null && pm10 >= sub.pm10_threshold;

      return pm25Trigger || pm10Trigger;
    });

    if (eligibleSubs.length > 0) {
      const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
      const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

      if (vapidPublicKey && vapidPrivateKey) {
        webpush.setVapidDetails(
          'mailto:portal@semear.org.br',
          vapidPublicKey,
          vapidPrivateKey
        );

        const pollutant = pm25 !== null && pm25 >= 35 ? "PM2.5" : "PM10";
        const value = pollutant === "PM2.5" ? pm25 : pm10;
        const threshold = pollutant === "PM2.5" 
          ? (eligibleSubs[0]?.pm25_threshold || 35)
          : (eligibleSubs[0]?.pm10_threshold || 0);

        const pushPayload = JSON.stringify({
          title: `Alerta: Qualidade do Ar - ${station.name}`,
          body: `Nível crítico de ${pollutant} detectado: ${value} µg/m³.`,
          icon: '/icons/icon-192.png',
          data: {
            url: `/dados?station=${stationCode}`,
            stationCode: stationCode,
            pollutant,
            value
          }
        });

        let triggeredCount = 0;
        await Promise.allSettled(
          eligibleSubs.map(async (sub) => {
            try {
              const pushSubscription = {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
              };
              await webpush.sendNotification(pushSubscription, pushPayload);
              triggeredCount++;

              await supabase
                .from("push_subscriptions")
                .update({
                  last_alert_at: new Date().toISOString(),
                  last_alert_pm25: pm25,
                  // note: we update state based on what triggered, but the table only has last_alert_pm25. 
                  // In a real scenario we might add last_alert_pm10 too.
                })
                .eq("id", sub.id);
            } catch (err) {
              console.error(`Failed to notify sub ${sub.id}:`, err.message);
            }
          })
        );

        // Log to push_events (no personal data, only measurement context)
        await supabase.from("push_events").insert({
          ts,
          station_code: stationCode,
          pollutant,
          value,
          triggered: triggeredCount > 0,
          reason: `${pollutant} ${value} µg/m³ > ${threshold} | ${triggeredCount}/${eligibleSubs.length} notificações enviadas`
        });
      }
    }
  } catch (err) {
    console.error("[PushAlert] Failed to process alerts:", err.message);
  }

  return json(200, { 
    ok: true,
    inserted: wasInserted,
    duplicated: wasDuplicated,
    station_code: stationCode
  });
});
