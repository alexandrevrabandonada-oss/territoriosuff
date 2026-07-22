import { applyPublicJsonHeaders, getIneaSupabaseClient, rejectNonGet, sendPublicError } from "../_http.js";

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const supabase = getIneaSupabaseClient();
    const { data, error } = await supabase.rpc("get_inea_controller_frequency");

    if (error) throw error;

    return res.status(200).json((data || []).map((row: any) => ({
      pollutant: row.pollutant,
      count: row.count,
      percentage: row.percentage
    })));
  } catch (err: any) {
    return sendPublicError(res, "api/air/inea/analytics/controller-frequency", err);
  }
}
