import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(455).json({ error: "Method Not Allowed" });
  }

  try {
    const { stationId, metricType, pollutant, from, to } = req.query;

    let query = supabase
      .from("air_measurements")
      .select("id, station_id, pollutant, value, unit, measured_at, averaging_period, quality_flag, metric_type, air_quality_index, air_quality_classification, controlling_pollutant, raw_column")
      .eq("source", "INEA");

    if (stationId) {
      query = query.eq("station_id", stationId);
    }
    if (metricType) {
      query = query.eq("metric_type", metricType);
    }
    if (pollutant) {
      query = query.eq("pollutant", pollutant);
    }
    if (from) {
      query = query.gte("measured_at", from);
    }
    if (to) {
      query = query.lte("measured_at", to);
    }

    // Default sorting by timestamp
    const { data: timeseries, error } = await query
      .order("measured_at", { ascending: true })
      .limit(5000); // Cap at a reasonable limit for API performance

    if (error) throw error;

    return res.status(200).json(timeseries || []);
  } catch (err: any) {
    console.error("[api/air/inea/timeseries] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
