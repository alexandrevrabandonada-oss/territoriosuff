import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

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
      .select("id")
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

    // Initialize 12 months stats
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      month_name: MONTH_NAMES[i],
      measured_days: 0,
      expected_days: 0,
      coverage_percent: 0.0,
      insufficient_data_days: 0,
      degraded_days: 0,
      degraded_percent_of_measured_days: 0.0,
      degraded_percent_of_expected_days: 0.0,
      caveat: "Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado não é qualidade boa."
    }));

    // Calculate expected days per month across all stations
    for (const station of stations) {
      const dates = stationDateWorst[station.id] || {};
      const sortedDates = Object.keys(dates).sort();
      if (sortedDates.length === 0) continue;

      const startDate = new Date(sortedDates[0]);
      const endDate = new Date(sortedDates[sortedDates.length - 1]);

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const m = currentDate.getMonth(); // 0-11
        monthlyStats[m].expected_days++;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Accumulate measured, degraded, insufficient days
    for (const dates of Object.values(stationDateWorst)) {
      for (const [dateStr, worstClass] of Object.entries(dates)) {
        const monthPart = parseInt(dateStr.split("-")[1], 10);
        if (monthPart >= 1 && monthPart <= 12) {
          const stat = monthlyStats[monthPart - 1];
          stat.measured_days++;
          if (worstClass === "DADO_INSUFICIENTE") {
            stat.insufficient_data_days++;
          } else if (worstClass !== "BOA") {
            stat.degraded_days++;
          }
        }
      }
    }

    // Calculate percentages
    for (const stat of monthlyStats) {
      stat.coverage_percent = stat.expected_days > 0 ? parseFloat(((stat.measured_days / stat.expected_days) * 100).toFixed(1)) : 0.0;
      stat.degraded_percent_of_measured_days = stat.measured_days > 0 ? parseFloat(((stat.degraded_days / stat.measured_days) * 100).toFixed(1)) : 0.0;
      stat.degraded_percent_of_expected_days = stat.expected_days > 0 ? parseFloat(((stat.degraded_days / stat.expected_days) * 100).toFixed(1)) : 0.0;
      stat.coverage_percent = Math.min(100.0, stat.coverage_percent);
    }

    return res.status(200).json(monthlyStats);
  } catch (err: any) {
    console.error("[api/air/inea/analytics/monthly-profile] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
