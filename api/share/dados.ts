import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { escapeHtml } from "./_html";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SHARE_HASH_SALT = process.env.SHARE_HASH_SALT || "semear_fallback_salt";
const VITE_PROJECT_NAME = process.env.VITE_PROJECT_NAME || "SEMEAR SF";

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("Missing Supabase server environment for share dados endpoint.");
    }
    if (!supabaseClient) {
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false }
        });
    }
    return supabaseClient;
}

function getHostUrl(req: any): string {
    const host = req.headers["x-forwarded-host"] || req.headers.host || "semear-pwa.vercel.app";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    return `${protocol}://${host}`;
}

function hashIp(ip: string, userAgent: string): string {
    return crypto
        .createHash("sha256")
        .update(`${ip}-${userAgent}-${SHARE_HASH_SALT}`)
        .digest("hex");
}

export default async function handler(req: any, res: any) {
    const { station_code } = req.query;
    if (!station_code) {
        return res.status(400).send("Bad Request: missing station_code");
    }
    const safeStationCode = encodeURIComponent(String(station_code));

    try {
        const supabase = getSupabaseClient();

        // 1. Fetch Station & Latest Measurement via Service Role
        const { data: station, error: stmtErr } = await supabase
            .from("stations")
            .select(`
                id, code, name,
                measurements (
                    pm25, pm10, ts
                )
            `)
            .eq("code", station_code)
            .order("ts", { referencedTable: "measurements", ascending: false })
            .limit(1, { referencedTable: "measurements" })
            .single();

        if (stmtErr) {
            console.warn(`[share/dados] Could not find station for ${station_code}`, stmtErr.message);
            return res.redirect(302, `/dados?station=${safeStationCode}`);
        }
        if (!station) {
            return res.redirect(302, `/dados?station=${safeStationCode}`);
        }

        const meas = station.measurements?.[0];
        let desc = "Confira a última leitura disponível desta estação de monitoramento no SEMEAR.";
        if (meas) {
            const timeStr = new Date(meas.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            desc = `PM2.5: ${meas.pm25.toFixed(1)} | PM10: ${meas.pm10.toFixed(1)} | Atualizado: ${timeStr}`;
        }

        // 2. Log Share Event explicitly bypassing RLS via Service Role
        const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection?.remoteAddress || "0.0.0.0";
        const userAgent = req.headers["user-agent"] || "unknown";
        const referrer = req.headers["referer"] || null;
        const hashedIp = hashIp(ip, userAgent);

        const { error: insertErr } = await supabase.from("share_events").insert({
            kind: "dados",
            slug: station.code,
            referrer,
            user_agent: userAgent,
            ip_hash: hashedIp
        });

        if (insertErr) {
            console.warn(`[share/dados] Failed to log telemetry for ${station.code}:`, insertErr.message);
        }

        // 3. Mount HTML with Open Graph
        const title = `Qualidade do ar agora — ${station.name} | ${VITE_PROJECT_NAME}`;
        const hostUrl = getHostUrl(req);
        const finalUrl = `${hostUrl}/dados?station=${encodeURIComponent(String(station.code))}`;
        const safeTitle = encodeURIComponent(station.name);
        const safeSubtitle = encodeURIComponent(desc);

        let fallbackImage = `${hostUrl}/api/og/card?kind=dados&title=${safeTitle}&subtitle=${safeSubtitle}`;
        if (meas) {
            const timeStr = new Date(meas.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            fallbackImage += `&pm25=${meas.pm25.toFixed(1)}&pm10=${meas.pm10.toFixed(1)}&time=${encodeURIComponent(timeStr)}`;
        }

        const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>

    <!-- Open Graph / Meta -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${escapeHtml(finalUrl)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(desc)}">
    <meta property="og:image" content="${escapeHtml(fallbackImage)}">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${escapeHtml(finalUrl)}">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(desc)}">
    <meta name="twitter:image" content="${escapeHtml(fallbackImage)}">

    <meta http-equiv="refresh" content="0; url=${escapeHtml(finalUrl)}">
</head>
<body>
    <p>Redirecionando para a estação... <a href="${escapeHtml(finalUrl)}">Clique aqui</a> se demorar.</p>
</body>
</html>`;

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=30");
        return res.status(200).send(html);

    } catch (err: any) {
        console.error("[share/dados] Fatal Error:", err);
        return res.redirect(302, `/dados?station=${safeStationCode}`);
    }
}
