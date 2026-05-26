import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const RANKS: Record<string, number> = {
  "DADO_INSUFICIENTE": 0,
  "BOA": 1,
  "MODERADA": 2,
  "RUIM": 3,
  "MUITO RUIM": 4,
  "PÉSSIMA": 5
};

function getValidatedClassification(row: any): string {
  const rawClass = (row.air_quality_classification || "BOA").toUpperCase().trim();
  
  if (row.quality_flag !== "OK") {
    return "DADO_INSUFICIENTE";
  }

  const aqiVal = row.air_quality_index ?? 0;
  
  if (aqiVal === 0) {
    const rawJson = row.raw_json || {};
    const subindexKeys = ["IQA MP10", "IQA MP2,5", "IQA SO2", "IQA NO2", "IQA O3", "IQA CO"];
    const hasValidSubindex = subindexKeys.some(key => {
      const val = rawJson[key];
      return val !== null && val !== undefined && val !== 0 && val !== "0";
    });

    if (!hasValidSubindex) {
      return "DADO_INSUFICIENTE";
    }
  }

  const validClasses = ["BOA", "MODERADA", "RUIM", "MUITO RUIM", "PÉSSIMA"];
  if (!validClasses.includes(rawClass)) {
    return "DADO_INSUFICIENTE";
  }

  return rawClass;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "GET") {
    return res.status(455).json({ error: "Method Not Allowed" });
  }

  try {
    const { data: stations, error: stationsError } = await supabase
      .from("air_stations")
      .select("id, name")
      .eq("source", "INEA");

    if (stationsError) throw stationsError;

    // Fetch all GENERAL_AQI measurements using pagination to bypass PostgREST limit of 1000
    let measurements: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from("air_measurements")
        .select("station_id, measured_at, air_quality_index, air_quality_classification, quality_flag, raw_json")
        .eq("source", "INEA")
        .eq("metric_type", "GENERAL_AQI")
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        measurements = measurements.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    // station_id -> date -> worst classification
    const stationDateWorst: Record<string, Record<string, string>> = {};

    for (const m of measurements) {
      const sId = m.station_id;
      const dateStr = m.measured_at.split("T")[0];
      const validatedClass = getValidatedClassification(m);

      if (!stationDateWorst[sId]) {
        stationDateWorst[sId] = {};
      }

      const existingClass = stationDateWorst[sId][dateStr];
      const existingRank = existingClass ? RANKS[existingClass] ?? -1 : -1;
      const currentRank = RANKS[validatedClass] ?? -1;

      if (currentRank > existingRank) {
        stationDateWorst[sId][dateStr] = validatedClass;
      }
    }

    const results = stations.map(station => {
      const dates = stationDateWorst[station.id] || {};
      const sortedDates = Object.keys(dates).sort();
      const measured_days = sortedDates.length;

      let expected_days = 0;
      if (measured_days > 0) {
        const startMs = new Date(sortedDates[0]).getTime();
        const endMs = new Date(sortedDates[measured_days - 1]).getTime();
        expected_days = Math.max(1, Math.ceil((endMs - startMs) / (24 * 60 * 60 * 1000)) + 1);
      }

      const insufficient_data_days = sortedDates.filter(d => dates[d] === "DADO_INSUFICIENTE").length;
      const degraded_days = sortedDates.filter(d => {
        const c = dates[d];
        return c !== "BOA" && c !== "DADO_INSUFICIENTE";
      }).length;

      const coverage_percent = expected_days > 0 ? parseFloat(((measured_days / expected_days) * 100).toFixed(1)) : 0.0;
      const degraded_percent_of_measured_days = measured_days > 0 ? parseFloat(((degraded_days / measured_days) * 100).toFixed(1)) : 0.0;
      const degraded_percent_of_expected_days = expected_days > 0 ? parseFloat(((degraded_days / expected_days) * 100).toFixed(1)) : 0.0;

      return {
        station_id: station.id,
        station_name: station.name,
        measured_days,
        expected_days,
        coverage_percent: Math.min(100.0, coverage_percent),
        insufficient_data_days,
        degraded_days,
        degraded_percent_of_measured_days,
        degraded_percent_of_expected_days,
        caveat: "Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado não é qualidade boa."
      };
    });

    // Sort by degraded percent of measured days descending
    results.sort((a, b) => b.degraded_percent_of_measured_days - a.degraded_percent_of_measured_days);

    return res.status(200).json(results);
  } catch (err: any) {
    console.error("[api/air/inea/analytics/degraded-days] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
