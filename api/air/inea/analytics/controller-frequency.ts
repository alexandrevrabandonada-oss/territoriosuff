import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(455).json({ error: "Method Not Allowed" });
  }

  try {
    const { data: measurements, error } = await supabase
      .from("air_measurements")
      .select("controlling_pollutant")
      .eq("source", "INEA")
      .eq("metric_type", "GENERAL_AQI");

    if (error) throw error;

    const pollutantCounts: Record<string, number> = {};
    let totalWithController = 0;

    for (const m of measurements || []) {
      if (m.controlling_pollutant) {
        const p = m.controlling_pollutant.toUpperCase().trim();
        pollutantCounts[p] = (pollutantCounts[p] || 0) + 1;
        totalWithController++;
      }
    }

    const results = Object.entries(pollutantCounts).map(([pollutant, count]) => {
      const percentage = totalWithController > 0 ? parseFloat(((count / totalWithController) * 100).toFixed(1)) : 0.0;
      return {
        pollutant,
        count,
        percentage
      };
    });

    // Sort by count descending
    results.sort((a, b) => b.count - a.count);

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("[api/air/inea/analytics/controller-frequency] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
