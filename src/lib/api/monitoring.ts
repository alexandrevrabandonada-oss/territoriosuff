import { isAboveOmsThreshold } from "../airQuality";
import {
  BlogPost,
  DownsampledMeasurement,
  EventSummary,
  getSupabase,
  Measurement,
  normalizeOpsKpi,
  OpsKPI,
  Station,
  StationHealth,
  StationKPI,
  StationOverview,
  SystemStatus,
  toAppError,
  toSafeNumber,
  TransparencySummary,
  isPublishTimeReached
} from "./core";

export async function getStationOverview(): Promise<StationOverview[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc("get_station_overview");
    if (error) throw error;
    return (data ?? []) as StationOverview[];
  } catch (error) {
    throw toAppError("Falha ao buscar visão geral das estações", error);
  }
}

export async function getStationHealth(): Promise<StationHealth[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc("get_station_health");
    if (error) throw error;
    return (data ?? []) as StationHealth[];
  } catch (error) {
    throw toAppError("Falha ao buscar saúde das estações", error);
  }
}

export async function listStations(): Promise<Station[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("stations").select("*").order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Station[];
  } catch (error) {
    throw toAppError("Falha ao listar estacoes", error);
  }
}

export async function getLatestMeasurements(stationId: string, limit = 20): Promise<Measurement[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("measurements")
      .select("*")
      .eq("station_id", stationId)
      .order("ts", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Measurement[];
  } catch (error) {
    throw toAppError("Falha ao listar medicoes", error);
  }
}

export async function getMeasurementsDownsampled(
  stationId: string,
  range: "24h" | "7d"
): Promise<DownsampledMeasurement[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc("get_measurements_downsampled", {
      p_station_id: stationId,
      p_range: range
    });
    if (error) throw error;
    return (data ?? []) as DownsampledMeasurement[];
  } catch (error) {
    throw toAppError("Falha ao listar medicoes consolidadas", error);
  }
}

export async function getMeasurementsByRange(
  stationId: string,
  startTs: string,
  endTs: string,
  bucketMinutes = 60
): Promise<DownsampledMeasurement[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc("get_measurements_by_range", {
      p_station_id: stationId,
      p_start_ts: startTs,
      p_end_ts: endTs,
      p_bucket_minutes: bucketMinutes
    });
    if (error) throw error;
    return (data ?? []) as DownsampledMeasurement[];
  } catch (error) {
    throw toAppError("Falha ao listar medições por período", error);
  }
}

export async function getOpsKpisMonth(year: number, month: number): Promise<OpsKPI> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc("get_ops_kpis_month", {
      p_year: year,
      p_month: month
    });
    if (error) throw error;
    return normalizeOpsKpi(data?.[0]);
  } catch (error) {
    throw toAppError("Falha ao buscar KPIs mensais de operacao", error);
  }
}

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    const supabase = await getSupabase();
    const contentApiPromise = import("./content");
    const transparencyApiPromise = import("./transparency");

    const [{ count: stationsCount }, { count: measurements24h }] = await Promise.all([
      supabase.from("stations").select("*", { count: "exact", head: true }),
      supabase.from("measurements")
        .select("*", { count: "exact", head: true })
        .gt("ts", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);

    const { data: latestM } = await supabase
      .from("measurements")
      .select("ts, station:stations(name)")
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const results = await Promise.all([
      supabase.from("events").select("id, title, start_at, location, capacity")
        .order("start_at", { ascending: true })
        .gt("start_at", new Date().toISOString())
        .limit(3),
      supabase.from("acervo_items").select("*").order("created_at", { ascending: false }).limit(3),
      contentApiPromise.then(({ listBlogPosts }) => listBlogPosts({ limit: 2 })),
      transparencyApiPromise.then(({ getTransparencySummary }) => getTransparencySummary()),
      supabase.from("expenses")
        .select("category, amount_cents")
        .gte("occurred_on", monthStart.toISOString().slice(0, 10))
        .lt("occurred_on", monthEnd.toISOString().slice(0, 10)),
      supabase.from("reports")
        .select("*", { count: "exact", head: true })
        .gte("published_at", monthStart.toISOString().slice(0, 10))
        .lt("published_at", monthEnd.toISOString().slice(0, 10)),
      supabase.from("expenses")
        .select("category, amount_cents")
        .gte("occurred_on", sevenDaysAgo.slice(0, 10)),
      supabase.from("share_events")
        .select("*", { count: "exact", head: true })
        .gt("occurred_at", sevenDaysAgo),
      supabase.from("share_events")
        .select("kind")
        .gt("occurred_at", sevenDaysAgo),
      supabase.rpc("get_top_shared_items", { p_days: 7 }),
      supabase.from("push_events")
        .select("*", { count: "exact", head: true })
        .gt("ts", sevenDaysAgo),
      supabase.from("push_events")
        .select("station_code")
        .gt("ts", sevenDaysAgo),
      supabase.from("push_events")
        .select("pollutant")
        .gt("ts", sevenDaysAgo),
      supabase.from("measurements")
        .select("station_id, pm25, pm10, station:stations(code, name)")
        .gt("ts", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.rpc("get_station_health"),
      supabase.rpc("get_ops_kpis_7d"),
      supabase.rpc("get_station_kpis_7d")
    ]);

    const events = results[0];
    const acervo = results[1];
    const blog = results[2] as BlogPost[];
    const transparency = results[3] as TransparencySummary;
    const monthExpensesResult = results[4] as { data: Array<{ category: string; amount_cents: number }> };
    const reportsPublishedMonth = results[5] as { count: number };
    const sevenDaysExpensesResult = results[6] as { data: Array<{ category: string; amount_cents: number }> };
    const social7d = results[7] as { count: number };
    const socialKinds = results[8] as { data: Array<{ kind: string | null }> };
    const topShares = results[9] as { data: any[] };
    const alerts7d = results[10] as { count: number };
    const alertsStations = results[11] as { data: any[] };
    const alertsPollutants = results[12] as { data: any[] };
    const breaches24hResult = results[13] as { data: Array<{ station_id?: string; pm25?: number | null; pm10?: number | null; station?: { code?: string | null; name?: string | null } | Array<{ code?: string | null; name?: string | null }> | null }> };
    const stationHealthData = results[14] as { data: StationHealth[] };
    const opsKpiResult = results[15] as { data: OpsKPI[] };
    const stationKpiResult = results[16] as { data: StationKPI[] };

    const stationCounts = new Map<string, number>();
    (alertsStations.data || []).forEach((item: any) => {
      const code = item.station_code;
      stationCounts.set(code, (stationCounts.get(code) || 0) + 1);
    });
    const topStations = Array.from(stationCounts.entries())
      .map(([station_code, count]) => ({ station_code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const socialByKind = (socialKinds.data || []).reduce((acc, item) => {
      const key = String(item.kind ?? "outros");
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pollutantCounts = new Map<string, number>();
    (alertsPollutants.data || []).forEach((item: any) => {
      const pol = item.pollutant;
      pollutantCounts.set(pol, (pollutantCounts.get(pol) || 0) + 1);
    });
    const topPollutants = Array.from(pollutantCounts.entries())
      .map(([pollutant, count]) => ({ pollutant, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const monthSummary = { total_cents: 0, by_category: {} as Record<string, number>, count: 0 };
    (monthExpensesResult.data || []).forEach((row) => {
      const amount = Number(row.amount_cents ?? 0);
      const cat = String(row.category ?? "outros");
      monthSummary.total_cents += amount;
      monthSummary.by_category[cat] = (monthSummary.by_category[cat] ?? 0) + amount;
      monthSummary.count += 1;
    });

    const sevenDaysSummary = { total_cents: 0, by_category: {} as Record<string, number>, count: 0 };
    (sevenDaysExpensesResult.data || []).forEach((row) => {
      const amount = Number(row.amount_cents ?? 0);
      const cat = String(row.category ?? "outros");
      sevenDaysSummary.total_cents += amount;
      sevenDaysSummary.by_category[cat] = (sevenDaysSummary.by_category[cat] ?? 0) + amount;
      sevenDaysSummary.count += 1;
    });

    const breachCountsByStationCode = new Map<string, number>();
    (breaches24hResult.data || []).forEach((row) => {
      const stationPayload = Array.isArray(row.station) ? row.station[0] : row.station;
      const stationCode = String(stationPayload?.code ?? "-");
      if (!isAboveOmsThreshold(row.pm25 ?? null, row.pm10 ?? null)) return;
      breachCountsByStationCode.set(stationCode, (breachCountsByStationCode.get(stationCode) || 0) + 1);
    });

    const networkHealth = { ok: 0, degraded: 0, offline: 0, unknown: 0 };
    (stationHealthData.data || []).forEach((health: StationHealth) => {
      const status = health.health_status as keyof typeof networkHealth;
      if (status in networkHealth) {
        networkHealth[status] += 1;
      }
    });

    return {
      monitoring: {
        stations_count: stationsCount || 0,
        measurements_24h: measurements24h || 0,
        latest_measurement: latestM ? {
          ts: String(latestM.ts),
          station_name: String((latestM.station as any)?.name || "N/A")
        } : null
      },
      content: {
        upcoming_events: (events.data ?? []) as EventSummary[],
        latest_acervo: ((acervo.data ?? []) as any[]).filter((item) => isPublishTimeReached(String(item.publish_at ?? "") || null)),
        latest_blog: blog,
        reports_published_month: reportsPublishedMonth.count || 0
      },
      transparency: {
        ...transparency,
        current_month_total_cents: monthSummary.total_cents,
        current_month_by_category: monthSummary.by_category,
        current_month_count: monthSummary.count,
        last_7d_total_cents: sevenDaysSummary.total_cents,
        last_7d_by_category: sevenDaysSummary.by_category,
        last_7d_count: sevenDaysSummary.count
      },
      social: {
        total_7d: social7d.count || 0,
        by_kind: socialByKind,
        top_slugs: (topShares.data || []) as { kind: string; slug: string; count: number }[]
      },
      alerts: {
        total_7d: alerts7d.count || 0,
        top_stations: topStations,
        top_pollutants: topPollutants
      },
      operations: {
        kpis: normalizeOpsKpi(opsKpiResult.data?.[0]),
        station_metrics: (stationKpiResult.data || []).map((row) => ({
          station_code: String(row.station_code ?? "-"),
          station_name: String(row.station_name ?? "Estação"),
          measurements_count: toSafeNumber(row.measurements_count),
          above_threshold_24h: toSafeNumber(breachCountsByStationCode.get(String(row.station_code ?? "-")) ?? 0)
        }))
      },
      network_health: networkHealth
    };
  } catch (error) {
    throw toAppError("Falha ao obter status do sistema", error);
  }
}
