import { applyPublicJsonHeaders, getIneaSupabaseClient, rejectNonGet, sendPublicError } from "../_http.js";

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const supabase = getIneaSupabaseClient();
    const { data, error } = await supabase.rpc("get_inea_data_gaps");

    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (err: any) {
    return sendPublicError(res, "api/air/inea/analytics/data-gaps", err);
  }
}
