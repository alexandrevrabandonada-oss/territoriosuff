import { createClient } from "@supabase/supabase-js";
import { applyPublicJsonHeaders, rejectNonGet } from "../_http";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const { data, error } = await supabase.rpc("get_inea_controller_frequency");

    if (error) throw error;

    return res.status(200).json((data || []).map((row: any) => ({
      pollutant: row.pollutant,
      count: row.count,
      percentage: row.percentage
    })));
  } catch (err: any) {
    console.error("[api/air/inea/analytics/controller-frequency] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
