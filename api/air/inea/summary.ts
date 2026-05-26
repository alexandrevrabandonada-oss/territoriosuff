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
    // 1. Get total stations
    const { data: stations, error: stationsError } = await supabase
      .from("air_stations")
      .select("id")
      .eq("source", "INEA");

    if (stationsError) throw stationsError;
    const totalStations = stations?.length || 0;

    // 2. Fetch all GENERAL_AQI measurements to compute statistics
    const { data: aqiData, error: aqiError } = await supabase
      .from("air_measurements")
      .select("measured_at, air_quality_classification, controlling_pollutant")
      .eq("source", "INEA")
      .eq("metric_type", "GENERAL_AQI");

    if (aqiError) throw aqiError;

    // 3. Fetch total measurements count
    const { count: totalMeasurements, error: countError } = await supabase
      .from("air_measurements")
      .select("*", { count: "exact", head: true })
      .eq("source", "INEA");

    if (countError) throw countError;

    // Compute stats
    let minDate = "";
    let maxDate = "";
    const moderateOrWorseDays = new Set<string>();
    const pollutantCounts: Record<string, number> = {};

    const RANKS = ["MODERADA", "RUIM", "MUITO RUIM", "PÉSSIMA"];

    if (aqiData && aqiData.length > 0) {
      minDate = aqiData[0].measured_at;
      maxDate = aqiData[0].measured_at;

      for (const row of aqiData) {
        if (row.measured_at < minDate) minDate = row.measured_at;
        if (row.measured_at > maxDate) maxDate = row.measured_at;

        // Group classification status
        const classification = (row.air_quality_classification || "").toUpperCase().trim();
        if (RANKS.includes(classification)) {
          const dateStr = row.measured_at.split("T")[0]; // YYYY-MM-DD
          moderateOrWorseDays.add(dateStr);
        }

        // Count controlling pollutant
        if (row.controlling_pollutant) {
          const p = row.controlling_pollutant.toUpperCase().trim();
          pollutantCounts[p] = (pollutantCounts[p] || 0) + 1;
        }
      }
    }

    // Find most frequent controlling pollutant
    let mostFrequentControllingPollutant = "-";
    let maxPollCount = 0;
    for (const [p, count] of Object.entries(pollutantCounts)) {
      if (count > maxPollCount) {
        maxPollCount = count;
        mostFrequentControllingPollutant = p;
      }
    }

    // Fetch MAX(measured_at) from air_measurements
    const { data: maxMeasuredData, error: maxMeasuredError } = await supabase
      .from("air_measurements")
      .select("measured_at")
      .eq("source", "INEA")
      .order("measured_at", { ascending: false })
      .limit(1);

    if (maxMeasuredError) throw maxMeasuredError;
    const latestMeasuredAt = maxMeasuredData?.[0]?.measured_at || null;

    // Fetch latest finished_at from air_ingest_runs
    const { data: runData } = await supabase
      .from("air_ingest_runs")
      .select("finished_at")
      .eq("source", "INEA")
      .eq("status", "success")
      .order("finished_at", { ascending: false })
      .limit(1);

    const latestRunFinishedAt = runData?.[0]?.finished_at || null;

    // Fetch latest ingested_at timestamp from measurements
    const { data: latestIngested, error: ingestedError } = await supabase
      .from("air_measurements")
      .select("ingested_at")
      .eq("source", "INEA")
      .order("ingested_at", { ascending: false })
      .limit(1);

    if (ingestedError) throw ingestedError;
    const latestIngestedAtMeas = latestIngested?.[0]?.ingested_at || null;

    // Pick the most recent one
    let latestIngestedAt = latestIngestedAtMeas;
    if (latestRunFinishedAt && (!latestIngestedAt || latestRunFinishedAt > latestIngestedAt)) {
      latestIngestedAt = latestRunFinishedAt;
    }

    return res.status(200).json({
      totalStations,
      timeRange: { minDate, maxDate: latestMeasuredAt || maxDate },
      totalMeasurements: totalMeasurements || 0,
      moderateOrWorseDaysCount: moderateOrWorseDays.size,
      mostFrequentControllingPollutant,
      source_system: "CKAN_XLSX",
      data_freshness_label: "Última base pública disponível",
      latest_measured_at: latestMeasuredAt || maxDate,
      latest_ingested_at: latestIngestedAt,
      is_realtime: false
    });
  } catch (err: any) {
    console.error("[api/air/inea/summary] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
