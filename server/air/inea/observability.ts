import { applyPublicJsonHeaders, getIneaSupabaseClient, rejectNonGet, sendPublicError } from "./_http.js";

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const supabase = getIneaSupabaseClient();
    const [{ data: summaryRows, error: summaryError }, { data: latestRows, error: latestError }, { data: gapRows, error: gapsError }] = await Promise.all([
      supabase.rpc("get_inea_summary"),
      supabase.rpc("get_inea_latest_snapshot"),
      supabase.rpc("get_inea_data_gaps")
    ]);

    if (summaryError) throw summaryError;
    if (latestError) throw latestError;
    if (gapsError) throw gapsError;

    const summary = summaryRows?.[0] || null;
    const latestStations = (latestRows || []).filter((row: any) => row.measured_at);
    const gaps = Array.isArray(gapRows) ? gapRows : [];
    const fragileStations = [...gaps]
      .sort((a: any, b: any) => {
        if (a.coverage_percent !== b.coverage_percent) return a.coverage_percent - b.coverage_percent;
        if (a.gap_count !== b.gap_count) return b.gap_count - a.gap_count;
        return b.max_gap_hours - a.max_gap_hours;
      })
      .slice(0, 5)
      .map((gap: any) => ({
        station_id: gap.station_id,
        station_name: gap.station_name,
        coverage_percent: gap.coverage_percent,
        gap_count: gap.gap_count,
        max_gap_hours: gap.max_gap_hours,
        window_is_inferred: Boolean(gap.window_is_inferred),
        operation_window_source: gap.operation_window_source || null
      }));

    return res.status(200).json({
      dataset: "inea_public_observability_snapshot",
      generated_at: new Date().toISOString(),
      source_system: summary?.source_system || "CKAN_XLSX",
      data_freshness_label: summary?.data_freshness_label || "Última base pública disponível",
      latest_measured_at: summary?.latest_measured_at || summary?.max_date || null,
      latest_ingested_at: summary?.latest_ingested_at || null,
      is_realtime: Boolean(summary?.is_realtime),
      total_stations: summary?.total_stations || 0,
      stations_with_reading_count: latestStations.length,
      inferred_windows_count: gaps.filter((gap: any) => gap.window_is_inferred).length,
      total_measurements: summary?.total_measurements || 0,
      moderate_or_worse_days_count: summary?.moderate_or_worse_days_count || 0,
      most_frequent_controlling_pollutant: summary?.most_frequent_controlling_pollutant || "-",
      historical_window: {
        min_date: summary?.min_date || "",
        max_date: summary?.max_date || ""
      },
      fragile_stations: fragileStations,
      related_endpoints: {
        summary: "/api/air/inea/summary",
        latest: "/api/air/inea/latest",
        gaps: "/api/air/inea/analytics/data-gaps",
        stations_metadata: "/api/air/inea/stations-metadata"
      },
      version: "2026-06-16"
    });
  } catch (err: any) {
    return sendPublicError(res, "api/air/inea/observability", err);
  }
}
