import { applyPublicJsonHeaders, getIneaSupabaseClient, rejectNonGet, sendPublicError } from "./_http";

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const supabase = getIneaSupabaseClient();
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
    return sendPublicError(res, "api/air/inea/stations", err);
  }
}
