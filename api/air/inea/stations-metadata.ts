import { createClient } from "@supabase/supabase-js";
import { applyPublicJsonHeaders, rejectNonGet } from "./_http";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
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
    console.error("[api/air/inea/stations-metadata] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
