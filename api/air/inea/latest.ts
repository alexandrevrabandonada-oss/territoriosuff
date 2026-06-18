import { createClient } from "@supabase/supabase-js";
import { applyPublicJsonHeaders, rejectNonGet } from "./_http";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const { data: snapshotRows, error: snapshotError } = await supabase.rpc("get_inea_latest_snapshot");
    if (snapshotError) throw snapshotError;
    const { data: freshnessRows, error: freshnessError } = await supabase.rpc("get_inea_freshness");
    if (freshnessError) throw freshnessError;

    const results = (snapshotRows || []).map((row: any) => ({
      station: {
        id: row.station_id,
        name: row.station_name,
        code: row.station_code,
        city: row.city,
        neighborhood: row.neighborhood,
        lat: row.lat,
        lng: row.lng,
        active: row.active
      },
      measured_at: row.measured_at,
      measurements: Array.isArray(row.measurements) ? row.measurements : []
    }));
    const freshness = freshnessRows?.[0] || null;

    return res.status(200).json({
      source_system: freshness?.source_system || "CKAN_XLSX",
      data_freshness_label: freshness?.data_freshness_label || "Última base pública disponível",
      latest_measured_at: freshness?.latest_measured_at || null,
      latest_ingested_at: freshness?.latest_ingested_at || null,
      is_realtime: Boolean(freshness?.is_realtime),
      stations: results
    });
  } catch (err: any) {
    console.error("[api/air/inea/latest] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
