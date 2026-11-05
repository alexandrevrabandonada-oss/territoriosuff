import { Link } from "react-router-dom";

import { formatAurassureLocalTime } from "../hooks/useAurassureStationStatus";
import { useAurassureLatestReading } from "../hooks/useAurassureLatestReading";

const formatValue = (value: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "—";

export function StationLiveReading({ stationId, showDetailsLink = true }: { stationId: number; showDetailsLink?: boolean }) {
  const { status, reading } = useAurassureLatestReading(stationId);
  const measuredTime = reading ? new Date(reading.measured_at).getTime() : NaN;
  const age = Date.now() - measuredTime;
  const invalidTime = reading && (!Number.isFinite(measuredTime) || age < -5 * 60_000);
  const stale = reading && !invalidTime && age > 45 * 60_000;

  return (
    <section className="mt-4 rounded-2xl border border-teal-200 bg-white p-4" aria-label="Última leitura pública da estação" aria-live="polite">
      <h2 className="text-base font-black text-slate-950">Última leitura da estação</h2>
      {status === "loading" && <p className="mt-2 text-sm text-slate-700">Consultando medições disponibilizadas…</p>}
      {status === "offline" && <p className="mt-2 text-sm text-slate-700">Sem conexão. As concentrações não podem ser atualizadas agora.</p>}
      {status === "error" && <p className="mt-2 text-sm text-slate-700">Não foi possível consultar as concentrações agora. Tente novamente quando houver conexão.</p>}
      {status === "empty" && <p className="mt-2 text-sm text-slate-700">Nenhuma concentração disponível nesta estação agora.</p>}
      {status === "available" && reading && <>
        <p className="mt-2 text-sm font-semibold text-slate-800">{invalidTime ? "Horário da medição precisa ser verificado" : stale ? "Leitura desatualizada" : "Última medição publicada"}</p>
        <p className="mt-1 text-xs text-slate-700">Medida em {formatAurassureLocalTime(reading.measured_at)} · média de 15 minutos</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-700">MP2,5 · partículas finas</p><p className="mt-1 text-2xl font-black text-slate-950">{formatValue(reading.pm25_ug_m3)} <span className="text-xs font-semibold">µg/m³</span></p></div>
          <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-700">MP10 · partículas inaláveis</p><p className="mt-1 text-2xl font-black text-slate-950">{formatValue(reading.pm10_ug_m3)} <span className="text-xs font-semibold">µg/m³</span></p></div>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-700">Leitura preliminar da rede complementar UFF/Aurassure. Sensores móveis têm limitações de precisão e podem diferir de estações de referência. Não é classificação oficial nem diagnóstico de saúde. Traço indica valor indisponível.</p>
      </>}
      <p className="mt-3 text-xs leading-5 text-slate-600">Coleta programada a cada 15 minutos; consulta atualizada a cada minuto com o aplicativo aberto. Registros com alertas de qualidade ficam indisponíveis e a transmissão pode atrasar.</p>
      {showDetailsLink && <Link to="/dados" className="mt-3 inline-block text-sm font-bold text-teal-800 underline underline-offset-2">Ver estações e histórico</Link>}
    </section>
  );
}
