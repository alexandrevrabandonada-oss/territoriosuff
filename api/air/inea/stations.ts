import { createClient } from "@supabase/supabase-js";
import { applyPublicJsonHeaders, rejectNonGet } from "./_http";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const { data: stations, error } = await supabase.rpc("get_inea_public_stations");

    if (error) throw error;

    return res.status(200).json(
      (stations || []).map((station: any) => ({
        id: station.station_id,
        name: station.station_name,
        code: station.station_code,
        city: station.city || null,
        neighborhood: station.neighborhood || null,
        lat: station.lat ?? null,
        lng: station.lng ?? null,
        active: Boolean(station.active)
      }))
    );
  } catch (err: any) {
    console.error("[api/air/inea/stations] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
