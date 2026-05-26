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
    const { data: stations, error } = await supabase
      .from("air_stations")
      .select("id, name, code, city, neighborhood, lat, lng, active")
      .eq("source", "INEA")
      .order("name", { ascending: true });

    if (error) throw error;

    return res.status(200).json(stations || []);
  } catch (err: any) {
    console.error("[api/air/inea/stations] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
