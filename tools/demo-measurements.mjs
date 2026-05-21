import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Load environment variables manually
if (fs.existsSync(".env.local")) {
    const envConfig = fs.readFileSync(".env.local", "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value && !key.startsWith("#")) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("FATAL: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runDemo() {
    console.log("=== Demo Measurements Generator ===");

    // 1. Find the target station
    const { data: stations, error: errStations } = await supabase
        .from("stations")
        .select("id, code, name");

    if (errStations) {
        console.error("Error fetching stations:", errStations.message);
        process.exit(1);
    }

    if (!stations || stations.length === 0) {
        console.error("No stations found. Please initialize the DB or create a station manually first.");
        process.exit(1);
    }

    // Prefer 'piloto', fallback to the first available
    const target = stations.find(s => s.code === 'piloto') || stations[0];
    console.log(`Targeting station: ${target.name} (${target.code})`);

    // 2. Generate 10 synthetic measurements
    const measurements = [];
    const now = new Date();

    for (let i = 0; i < 10; i++) {
        const ts = new Date(now.getTime() - (i * 5 * 60000)); // Every 5 minutes in the past

        // Subtle variations
        const pm25 = 12.5 + (Math.random() * 5 - 2.5);
        const pm10 = 24.1 + (Math.random() * 8 - 4.0);
        const temp = 26.5 + (Math.random() * 2 - 1.0);
        const humidity = 65.0 + (Math.random() * 10 - 5.0);

        measurements.push({
            station_id: target.id,
            ts: ts.toISOString(),
            pm25,
            pm10,
            temp,
            humidity,
            quality_flag: 'OK'
        });
    }

    // Reverse to simulate chronological insertion
    measurements.reverse();

    const { error: errInsert } = await supabase
        .from("measurements")
        .insert(measurements);

    if (errInsert) {
        console.error("Error inserting measurements:", errInsert.message);
        process.exit(1);
    }

    // 3. Update station presence logic
    const { error: errUpdate } = await supabase
        .from("stations")
        .update({
            last_seen_at: now.toISOString(),
            status: 'online'
        })
        .eq("id", target.id);

    if (errUpdate) {
        console.error("Error updating station status:", errUpdate.message);
        process.exit(1);
    }

    console.log(`OK inserted=10 station=${target.name}`);
    process.exit(0);
}

void runDemo();
