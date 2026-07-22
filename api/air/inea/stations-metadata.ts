import { applyPublicJsonHeaders, getIneaSupabaseClient, rejectNonGet, sendPublicError } from "./_http.js";

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const supabase = getIneaSupabaseClient();
    const stationId = typeof req.query.stationId === "string" ? req.query.stationId.trim() : "";
    const { data: stations, error } = await supabase.rpc("get_inea_public_stations", {
      p_station_id: stationId || null
    });
    if (error) throw error;

    const items = (stations || []).map((station: any) => ({
      station_id: station.station_id,
      station_name: station.station_name,
      station_code: station.station_code,
      city: station.city || null,
      neighborhood: station.neighborhood || null,
      lat: station.lat ?? null,
      lng: station.lng ?? null,
      active: Boolean(station.active),
      operation_window: {
        start_date: station.operation_start_date || null,
        end_date: station.operation_end_date || null,
        source: station.operation_window_source || null,
        is_inferred: Boolean(station.window_is_inferred)
      },
      provenance: {
        station_source_table: "public.air_stations",
        measurement_source_filter: "source = INEA",
        methodology_version: "2026-06-16",
        notes: [
          "Metadados operacionais sustentam calculos de cobertura e lacunas do Radar INEA.",
          "Estacoes sem janela operacional completa continuam com inferencia controlada em alguns indicadores."
        ]
      }
    }));

    return res.status(200).json({
      dataset: "inea_air_stations_public_metadata",
      description: "Contrato publico de metadados operacionais e territoriais das estacoes do Radar INEA.",
      filters: {
        stationId: "Opcional. Retorna apenas a estacao informada."
      },
      items,
      total: items.length,
      version: "2026-06-16"
    });
  } catch (err: any) {
    return sendPublicError(res, "api/air/inea/stations-metadata", err);
  }
}
