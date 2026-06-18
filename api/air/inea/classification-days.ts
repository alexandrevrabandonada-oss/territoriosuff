import { createClient } from "@supabase/supabase-js";
import { applyPublicJsonHeaders, isValidDateInput, rejectNonGet } from "./_http";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const { stationId, from, to } = req.query;
    if (from && !isValidDateInput(String(from))) {
      return res.status(400).json({ error: "Invalid 'from' date" });
    }
    if (to && !isValidDateInput(String(to))) {
      return res.status(400).json({ error: "Invalid 'to' date" });
    }
    const { data: rows, error } = await supabase.rpc("get_inea_classification_days", {
      p_station_id: stationId || null,
      p_from: from || null,
      p_to: to || null
    });
    if (error) throw error;
    const breakdown = Object.fromEntries(
      (rows || []).map((row: any) => [
        row.station_id,
        {
          BOA: row.boa || 0,
          MODERADA: row.moderada || 0,
          RUIM: row.ruim || 0,
          "MUITO RUIM": row.muito_ruim || 0,
          "PÉSSIMA": row.pessima || 0,
          moderateOrWorseDays: row.moderate_or_worse_days || 0,
          totalDays: row.total_days || 0
        }
      ])
    );

    if (stationId) {
      const result = breakdown[stationId as string] || {
        BOA: 0,
        MODERADA: 0,
        RUIM: 0,
        "MUITO RUIM": 0,
        "PÉSSIMA": 0,
        moderateOrWorseDays: 0,
        totalDays: 0
      };
      return res.status(200).json(result);
    }

    return res.status(200).json(breakdown);
  } catch (err: any) {
    console.error("[api/air/inea/classification-days] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
