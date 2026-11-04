import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase/client";

// Only public operational telemetry (counts, freshness and coverage).
// NEVER read Aurassure private measurement staging or API snapshots here.
export type AurassurePublicStationStatus = {
  station_id: number;
  station_name: string;
  neighborhood: string;
  source_label: string;
  last_measured_at: string | null;
  last_capture_at: string | null;
  last_checked_at: string;
  readings_last_24h: number;
  coverage_24h_percent: number;
  collection_status: "receiving" | "coverage_degraded" | "stale" | "no_measurements";
  release_status: "measurements_pending_technical_review";
};

export function useAurassureStationStatus() {
  const [stations, setStations] = useState<AurassurePublicStationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let requestVersion = 0;

    async function refresh() {
      const currentRequest = ++requestVersion;
      function restoreSaved() {
        setStations([]);
        setSavedAt(null);
        try {
          const raw = localStorage.getItem("semear-station-status-v1");
          if (!raw) return;
          const saved = JSON.parse(raw) as { stations: AurassurePublicStationStatus[]; savedAt: string };
          if (Array.isArray(saved.stations) && typeof saved.savedAt === "string") {
            setStations(saved.stations);
            setSavedAt(saved.savedAt);
          }
        } catch { /* Unavailable or invalid storage is treated as no saved data. */ }
      }
      if (!navigator.onLine) {
        if (!cancelled) {
          restoreSaved();
          setError("Sem conexão para atualizar a disponibilidade das estações.");
          setLoading(false);
        }
        return;
      }
      if (!supabase) {
        if (!cancelled) {
          restoreSaved();
          setError("A conexão pública ao banco não está configurada.");
          setLoading(false);
        }
        return;
      }

      const { data, error: queryError } = await supabase
        .from("aurassure_public_station_status")
        .select("station_id,station_name,neighborhood,source_label,last_measured_at,last_capture_at,last_checked_at,readings_last_24h,coverage_24h_percent,collection_status,release_status")
        .order("station_id", { ascending: true });

      if (cancelled || currentRequest !== requestVersion) return;
      if (queryError) {
        restoreSaved();
        setError("Não foi possível consultar a disponibilidade das estações.");
      } else {
        const publicStations = (data ?? []) as AurassurePublicStationStatus[];
        setStations(publicStations);
        setSavedAt(null);
        try {
          localStorage.setItem("semear-station-status-v1", JSON.stringify({ stations: publicStations, savedAt: new Date().toISOString() }));
        } catch { /* Data can still be displayed without local storage. */ }
        setError(null);
      }
      setLoading(false);
    }

    void refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 60_000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
    };
  }, []);

  return { stations, loading, error, savedAt };
}

export function stationCollectionLabel(
  status: AurassurePublicStationStatus | undefined,
  now = Date.now()
) {
  if (!status) return "Aguardando confirmação";
  const checked = new Date(status.last_checked_at).getTime();
  if (!Number.isFinite(checked) || now - checked > 45 * 60_000) return "Situação desatualizada";
  switch (status.collection_status) {
    case "receiving": return "Recebendo medições";
    case "coverage_degraded": return "Cobertura incompleta";
    case "stale": return "Medições atrasadas";
    case "no_measurements": return "Sem registros";
    default: return "Aguardando confirmação";
  }
}

export function stationCollectionTone(status: AurassurePublicStationStatus | undefined) {
  const label = stationCollectionLabel(status);
  if (label === "Recebendo medições") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (label === "Cobertura incompleta") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

export function formatAurassureLocalTime(value: string | null | undefined) {
  if (!value) return "Sem horário disponível";
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return "Horário indisponível";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",month: "2-digit",year: "numeric",hour: "2-digit",minute: "2-digit"
  }).format(time) + " (Brasília)";
}
