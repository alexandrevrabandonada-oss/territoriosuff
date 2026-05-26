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
    // 1. Fetch all stations
    const { data: stations, error: stationsError } = await supabase
      .from("air_stations")
      .select("id, name, code, city, neighborhood, lat, lng, active")
      .eq("source", "INEA");

    if (stationsError) throw stationsError;
    if (!stations || stations.length === 0) {
      return res.status(200).json([]);
    }

    // 2. For each station, get the latest measured_at and then all measurements for that timestamp
    const latestPromises = stations.map(async (station) => {
      const { data: latestTsData, error: tsError } = await supabase
        .from("air_measurements")
        .select("measured_at")
        .eq("station_id", station.id)
        .order("measured_at", { ascending: false })
        .limit(1);

      if (tsError) throw tsError;
      if (!latestTsData || latestTsData.length === 0) {
        return {
          station,
          measured_at: null,
          measurements: []
        };
      }

      const latestTs = latestTsData[0].measured_at;

      const { data: measurements, error: mError } = await supabase
        .from("air_measurements")
        .select("id, pollutant, value, unit, measured_at, averaging_period, quality_flag, metric_type, air_quality_index, air_quality_classification, controlling_pollutant, raw_column")
        .eq("station_id", station.id)
        .eq("measured_at", latestTs);

      if (mError) throw mError;

      return {
        station,
        measured_at: latestTs,
        measurements: measurements || []
      };
    });

    const results = await Promise.all(latestPromises);

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
      source_system: "CKAN_XLSX",
      data_freshness_label: "Última base pública disponível",
      latest_measured_at: latestMeasuredAt,
      latest_ingested_at: latestIngestedAt,
      is_realtime: false,
      stations: results
    });
  } catch (err: any) {
    console.error("[api/air/inea/latest] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
