import { applyPublicJsonHeaders, getIneaSupabaseClient, rejectNonGet, sendPublicError } from "./_http";

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const supabase = getIneaSupabaseClient();
    const { data, error } = await supabase.rpc("get_inea_summary");

    if (error) throw error;
    const row = data?.[0];
    if (!row) {
      return res.status(200).json({
        totalStations: 0,
        timeRange: { minDate: "", maxDate: "" },
        totalMeasurements: 0,
        moderateOrWorseDaysCount: 0,
        mostFrequentControllingPollutant: "-",
        source_system: "CKAN_XLSX",
        data_freshness_label: "Última base pública disponível",
        latest_measured_at: null,
        latest_ingested_at: null,
        is_realtime: false
      });
    }

    return res.status(200).json({
      totalStations: row.total_stations || 0,
      timeRange: {
        minDate: row.min_date || "",
        maxDate: row.max_date || ""
      },
      totalMeasurements: row.total_measurements || 0,
      moderateOrWorseDaysCount: row.moderate_or_worse_days_count || 0,
      mostFrequentControllingPollutant: row.most_frequent_controlling_pollutant || "-",
      source_system: row.source_system || "CKAN_XLSX",
      data_freshness_label: row.data_freshness_label || "Última base pública disponível",
      latest_measured_at: row.latest_measured_at || row.max_date || null,
      latest_ingested_at: row.latest_ingested_at || null,
      is_realtime: Boolean(row.is_realtime)
    });
  } catch (err: any) {
    return sendPublicError(res, "api/air/inea/summary", err);
  }
}
