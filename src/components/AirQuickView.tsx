import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { formatAurassureLocalTime, stationCollectionLabel, useAurassureStationStatus } from "../hooks/useAurassureStationStatus";
import { StationLiveReading } from "./StationLiveReading";

const STATIONS = [
  { id: 46560, name: "UFF · Vila Santa Cecília" },
  { id: 46561, name: "IFRJ · Nossa Senhora das Graças" },
  { id: 46562, name: "CRIAAD · Vila Mury" }
];
const FAVORITE_KEY = "semear-favorite-station-v1";

export function AirQuickView() {
  const { stations, loading, error, savedAt } = useAurassureStationStatus();
  const [selected, setSelected] = useState(46560);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(FAVORITE_KEY));
      if (STATIONS.some((station) => station.id === saved)) setSelected(saved);
    } catch { /* Storage may be unavailable. */ }
  }, []);

  const status = stations.find((station) => station.station_id === selected);
  function selectStation(value: number) {
    setSelected(value);
    try { localStorage.setItem(FAVORITE_KEY, String(value)); } catch { /* Selection still works for this visit. */ }
  }

  return (
    <section className="mx-auto mb-8 max-w-7xl rounded-3xl bg-white p-5 text-slate-900 shadow-lg ring-1 ring-slate-200 sm:p-8" aria-labelledby="quick-air-title">
      <div className="grid gap-7 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-bold text-teal-700">Observatório do Ar · Volta Redonda</p>
          <h1 id="quick-air-title" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Acompanhe o ar da sua cidade</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">Acompanhe as estações da rede UFF/Aurassure e consulte as leituras liberadas para divulgação.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-teal-800 px-4 py-3 text-sm font-bold text-white" to="/dados">Ver todas as estações</Link>
            <Link className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-800" to="/qualidade-ar/inea?modo=tempo">Explorar histórico INEA</Link>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
          <label htmlFor="quick-station" className="block text-sm font-bold">Sua estação favorita</label>
          <select id="quick-station" value={selected} onChange={(event) => selectStation(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900">
            {STATIONS.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}
          </select>
          <StationLiveReading stationId={selected} />
          <div className="mt-4" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Operação da estação · UFF/Aurassure</p>
            <p className="mt-1 text-lg font-bold">{status ? stationCollectionLabel(status) : loading ? "Consultando estação…" : "Situação indisponível"}</p>
            {status && <p className="mt-1 text-sm text-slate-700">Última medição recebida: {formatAurassureLocalTime(status.last_measured_at)}</p>}
            {savedAt && <p className="mt-1 text-sm font-semibold text-amber-800">Consulta salva em {formatAurassureLocalTime(savedAt)}. Pode estar desatualizada.</p>}
            {!status && !loading && <p className="mt-1 text-sm text-slate-700">{error || "Nenhum dado operacional disponível para esta estação."}</p>}
          </div>
          <p className="mt-4 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-700">A operação da estação não indica se o ar está bom ou ruim.</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">O histórico INEA é uma base consolidada, não uma medição em tempo real.</p>
        </div>
      </div>
    </section>
  );
}
