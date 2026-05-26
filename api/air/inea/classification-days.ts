import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const RANKS: Record<string, number> = {
  "BOA": 1,
  "MODERADA": 2,
  "RUIM": 3,
  "MUITO RUIM": 4,
  "PÉSSIMA": 5
};

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(455).json({ error: "Method Not Allowed" });
  }

  try {
    const { stationId, from, to } = req.query;

    let query = supabase
      .from("air_measurements")
      .select("measured_at, air_quality_classification, station_id")
      .eq("source", "INEA")
      .eq("metric_type", "GENERAL_AQI");

    if (stationId) {
      query = query.eq("station_id", stationId);
    }
    if (from) {
      query = query.gte("measured_at", from);
    }
    if (to) {
      query = query.lte("measured_at", to);
    }

    const { data: rows, error } = await query.order("measured_at", { ascending: true });
    if (error) throw error;

    // Grouping by station and date to find the worst classification of each day
    // Key: station_id -> date -> worst classification rank
    const stationDateWorst: Record<string, Record<string, string>> = {};

    for (const row of rows || []) {
      const sId = row.station_id;
      const dateStr = row.measured_at.split("T")[0]; // YYYY-MM-DD
      const rawClass = (row.air_quality_classification || "BOA").toUpperCase().trim();
      const currentRank = RANKS[rawClass] || 0;

      if (!stationDateWorst[sId]) {
        stationDateWorst[sId] = {};
      }

      const existingClass = stationDateWorst[sId][dateStr];
      const existingRank = existingClass ? RANKS[existingClass] || 0 : 0;

      if (currentRank > existingRank) {
        stationDateWorst[sId][dateStr] = rawClass;
      }
    }

    // Now calculate breakdown per station
    const breakdown: Record<string, {
      BOA: number;
      MODERADA: number;
      RUIM: number;
      "MUITO RUIM": number;
      "PÉSSIMA": number;
      moderateOrWorseDays: number;
      totalDays: number;
    }> = {};

    for (const [sId, dates] of Object.entries(stationDateWorst)) {
      breakdown[sId] = {
        BOA: 0,
        MODERADA: 0,
        RUIM: 0,
        "MUITO RUIM": 0,
        "PÉSSIMA": 0,
        moderateOrWorseDays: 0,
        totalDays: 0
      };

      for (const rawClass of Object.values(dates)) {
        breakdown[sId].totalDays++;
        if (rawClass === "BOA") breakdown[sId].BOA++;
        else if (rawClass === "MODERADA") breakdown[sId].MODERADA++;
        else if (rawClass === "RUIM") breakdown[sId].RUIM++;
        else if (rawClass === "MUITO RUIM") breakdown[sId]["MUITO RUIM"]++;
        else if (rawClass === "PÉSSIMA") breakdown[sId]["PÉSSIMA"]++;

        if (rawClass !== "BOA") {
          breakdown[sId].moderateOrWorseDays++;
        }
      }
    }

    if (stationId) {
      // If single station requested, return its breakdown directly
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

    // If all stations, return the grouped breakdown
    return res.status(200).json(breakdown);
  } catch (err: any) {
    console.error("[api/air/inea/classification-days] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
