import { applyPublicJsonHeaders, getIneaSupabaseClient, rejectNonGet, sendPublicError } from "./_http";

function buildExportUrl(params: Record<string, string>) {
  const search = new URLSearchParams(params);
  return `/api/air/inea/export?${search.toString()}`;
}

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const supabase = getIneaSupabaseClient();
    const [{ data: summaryRows, error: summaryError }, { data: stations, error: stationsError }] = await Promise.all([
      supabase.rpc("get_inea_summary"),
      supabase.rpc("get_inea_public_stations")
    ]);

    if (summaryError) throw summaryError;
    if (stationsError) throw stationsError;

    const summary = summaryRows?.[0] || null;
    const minYear = summary?.min_date ? Number(String(summary.min_date).slice(0, 4)) : null;
    const maxYear = summary?.max_date ? Number(String(summary.max_date).slice(0, 4)) : null;

    const yearlyPartitions =
      minYear && maxYear
        ? Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
            const year = minYear + index;
            return {
              year,
              from: `${year}-01-01T00:00:00.000Z`,
              to: `${year}-12-31T23:59:59.999Z`,
              url: buildExportUrl({
                metricType: "GENERAL_AQI",
                from: `${year}-01-01T00:00:00.000Z`,
                to: `${year}-12-31T23:59:59.999Z`
              })
            };
          })
        : [];

    const stationPartitions = (stations || []).map((station: any) => ({
      station_id: station.station_id,
      station_name: station.station_name,
      station_code: station.station_code,
      city: station.city || null,
      neighborhood: station.neighborhood || null,
      lat: station.lat ?? null,
      lng: station.lng ?? null,
      active: Boolean(station.active),
      operation_start_date: station.operation_start_date || null,
      operation_end_date: station.operation_end_date || null,
      operation_window_source: station.operation_window_source || null,
      station_metadata_url: `/api/air/inea/stations-metadata?stationId=${encodeURIComponent(station.station_id)}`,
      url: buildExportUrl({
        stationId: station.station_id,
        metricType: "GENERAL_AQI"
      })
    }));

    return res.status(200).json({
      dataset: "inea_air_measurements_public_export_catalog",
      description: "Catálogo público de partições reprodutíveis para exportação CSV do Radar INEA.",
      base_export_endpoint: "/api/air/inea/export",
      suggested_strategy: [
        "Use partições anuais para auditorias amplas da série histórica.",
        "Use partições por estação para inspeção focal de cobertura e consistência local.",
        "Para séries muito grandes, combine filtros de estação e ano."
      ],
      metadata_contract_endpoint: "/api/air/inea/stations-metadata",
      available_years: {
        min_year: minYear,
        max_year: maxYear,
        partitions: yearlyPartitions
      },
      available_stations: stationPartitions,
      version: "2026-06-16"
    });
  } catch (err: any) {
    return sendPublicError(res, "api/air/inea/export-catalog", err);
  }
}
