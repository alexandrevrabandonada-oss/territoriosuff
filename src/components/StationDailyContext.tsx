import { useEffect, useState } from "react";

import { formatAurassureLocalTime } from "../hooks/useAurassureStationStatus";
import { supabase } from "../lib/supabase/client";

type Sample = { measured_at: string; pm25_ug_m3: number | null; pm10_ug_m3: number | null };
type Result = { key: string; status: "loading" | "error" | "ready"; samples: Sample[] };
const EXPECTED = 96;
const MINIMUM = 72;
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

function summary(samples: Sample[], field: "pm25_ug_m3" | "pm10_ug_m3") {
  const values = samples.map((sample) => sample[field]).filter((value): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= 0
  );
  return { count: values.length, average: values.length >= MINIMUM ? values.reduce((sum, value) => sum + value, 0) / values.length : null };
}

export function StationDailyContext({ stationId, measuredAt }: { stationId: number; measuredAt: string }) {
  const key = `${stationId}:${measuredAt}`;
  const [result, setResult] = useState<Result>({ key, status: "loading", samples: [] });

  useEffect(() => {
    let cancelled = false;
    const end = new Date(measuredAt).getTime();
    setResult({ key, status: "loading", samples: [] });
    async function load() {
      if (!supabase || !navigator.onLine || !Number.isFinite(end)) {
        setResult({ key, status: "error", samples: [] });
        return;
      }
      try {
        const { data, error } = await supabase.from("aurassure_preliminary_readings")
          .select("measured_at,pm25_ug_m3,pm10_ug_m3")
          .eq("station_id", stationId).eq("averaging_period_seconds", 900)
          .gt("measured_at", new Date(end - 24 * 60 * 60_000).toISOString())
          .lte("measured_at", new Date(end).toISOString())
          .order("measured_at", { ascending: true }).limit(EXPECTED);
        if (cancelled) return;
        if (error) { setResult({ key, status: "error", samples: [] }); return; }
        const unique = new Map<string, Sample>();
        for (const sample of (data || []) as Sample[]) {
          const timestamp = new Date(sample.measured_at).getTime();
          if (Number.isFinite(timestamp) && timestamp > end - 24 * 60 * 60_000 && timestamp <= end) unique.set(sample.measured_at, sample);
        }
        setResult({ key, status: "ready", samples: [...unique.values()] });
      } catch {
        if (!cancelled) setResult({ key, status: "error", samples: [] });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [key, measuredAt, stationId]);

  const current = result.key === key ? result : { key, status: "loading" as const, samples: [] };
  const items = [
    { label: "MP2,5", guide: 15, ...summary(current.samples, "pm25_ug_m3") },
    { label: "MP10", guide: 45, ...summary(current.samples, "pm10_ug_m3") }
  ];

  return (
    <div className="mt-4 border-t border-slate-200 pt-4" aria-label="Comparação com a OMS">
      <h3 className="text-sm font-black text-slate-900">Como comparar com a OMS</h3>
      <p className="mt-1 text-xs leading-5 text-slate-700">Média das 24 horas encerradas em {formatAurassureLocalTime(measuredAt)}. Os valores acima são médias de 15 minutos e não devem ser comparados diretamente a estes parâmetros.</p>
      {current.status === "loading" && <p className="mt-2 text-sm text-slate-600">Calculando médias de 24 horas…</p>}
      {current.status === "error" && <p className="mt-2 text-sm text-slate-700">Não foi possível calcular a comparação agora.</p>}
      {current.status === "ready" && <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => <div key={item.label} className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-700">{item.label} · média em 24h</p>
          {item.average === null ? <p className="mt-1 text-sm font-bold text-slate-900">Dados insuficientes</p> : <>
            <p className="mt-1 text-lg font-black text-slate-950">{number.format(item.average)} <span className="text-xs font-semibold">µg/m³</span></p>
            <p className="text-xs font-bold text-slate-800">{Math.abs(item.average - item.guide) < 0.01 ? "Próximo ao valor" : item.average > item.guide ? "Acima do valor" : "Abaixo do valor"} de referência da OMS</p>
          </>}
          <p className="mt-1 text-xs text-slate-600">Referência OMS: {item.guide} µg/m³ em 24h · {item.count}/{EXPECTED} leituras</p>
        </div>)}
      </div>}
      <p className="mt-2 text-xs leading-5 text-slate-600">Cálculo preliminar com pelo menos 72 de 96 leituras por poluente; lacunas podem alterar a média. O valor-guia de 24h da OMS considera o 99º percentil anual. Esta comparação não é avaliação oficial de conformidade nem garante ausência de risco. <a href="https://www.who.int/teams/environment-climate-change-and-health/air-quality-and-health/health-impacts/types-of-pollutants" target="_blank" rel="noreferrer" className="font-bold text-teal-800 underline">Ver referência da OMS</a>.</p>
    </div>
  );
}
