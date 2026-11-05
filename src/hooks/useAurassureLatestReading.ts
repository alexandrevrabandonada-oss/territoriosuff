import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase/client";

export type PublicSensorReading = {
  station_id: number;
  measured_at: string;
  averaging_period_seconds: number;
  pm25_ug_m3: number | null;
  pm10_ug_m3: number | null;
};

type ReadingState = {
  stationId: number;
  status: "loading" | "available" | "empty" | "offline" | "error";
  reading: PublicSensorReading | null;
};

/** Reads the limited public preliminary view; raw vendor data stays private. */
export function useAurassureLatestReading(stationId: number) {
  const [state, setState] = useState<ReadingState>({ stationId, status: "loading", reading: null });

  useEffect(() => {
    let cancelled = false;
    let requestVersion = 0;

    async function refresh() {
      const version = ++requestVersion;
      if (!navigator.onLine) {
        setState({ stationId, status: "offline", reading: null });
        return;
      }
      if (!supabase) {
        setState({ stationId, status: "error", reading: null });
        return;
      }
      try {
        const { data, error } = await supabase
          .from("aurassure_preliminary_readings")
          .select("station_id,measured_at,averaging_period_seconds,pm25_ug_m3,pm10_ug_m3")
          .eq("station_id", stationId)
          .eq("averaging_period_seconds", 900)
          .order("measured_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cancelled || version !== requestVersion) return;
        if (error) {
          setState({ stationId, status: "error", reading: null });
        } else if (!data) {
          setState({ stationId, status: "empty", reading: null });
        } else {
          setState({ stationId, status: "available", reading: data as PublicSensorReading });
        }
      } catch {
        if (!cancelled && version === requestVersion) setState({ stationId, status: "error", reading: null });
      }
    }

    setState({ stationId, status: "loading", reading: null });
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 60_000);
    const onVisibilityChange = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
    };
  }, [stationId]);

  return state.stationId === stationId ? state : { stationId, status: "loading" as const, reading: null };
}
