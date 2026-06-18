import type { StationMetadataItem, SummaryStats } from "./RadarTypes";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE, RADAR_OFFICIAL_RECORD_QAQC_NOTE } from "../../../data/air/radar-copy";

interface RadarMaturityScorecardProps {
  summary: SummaryStats;
  stationMetadata: StationMetadataItem[];
  compact?: boolean;
}

type MaturityLevel = "strong" | "advancing" | "experimental";

function getToneClasses(level: MaturityLevel) {
  switch (level) {
    case "strong":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
        card: "border-emerald-200 bg-emerald-50/70"
      };
    case "advancing":
      return {
        badge: "border-sky-200 bg-sky-50 text-sky-800",
        card: "border-sky-200 bg-sky-50/70"
      };
    default:
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-900",
        card: "border-amber-200 bg-amber-50/70"
      };
  }
}

export function RadarMaturityScorecard({ summary, stationMetadata, compact = false }: RadarMaturityScorecardProps) {
  const totalStations = stationMetadata.length || summary.totalStations || 0;
  const explicitWindows = stationMetadata.filter((item) => !item.operation_window.is_inferred).length;
  const explicitShare = totalStations > 0 ? explicitWindows / totalStations : 0;
  const analyticsHealth = summary.totalMeasurements > 0 ? "strong" : "advancing";

  const items: Array<{
    axis: string;
    level: MaturityLevel;
    status: string;
    description: string;
    nextStep: string;
  }> = [
    {
      axis: "Auditabilidade",
      level: "strong",
      status: "Manifesto, CSV bruto e catálogo público já publicados.",
      description: "O Radar já permite reprodução externa da análise sem depender apenas da interface visual.",
      nextStep: "Versionar changelog metodológico público por release."
    },
    {
      axis: "Cobertura operacional",
      level: explicitShare >= 0.75 ? "strong" : explicitShare >= 0.4 ? "advancing" : "experimental",
      status:
        explicitWindows > 0
          ? `${explicitWindows}/${totalStations} estações com janela operacional explícita.`
          : "Estações ainda dependem amplamente de inferência controlada.",
      description: "A confiança sobe quando a janela esperada da estação deixa de depender de reconstrução editorial.",
      nextStep: "Publicar metadata operacional explícita para toda a malha."
    },
    {
      axis: "Confiança metodológica",
      level: "advancing",
      status: "O portal já diferencia evidência forte, leitura interpretativa e camada experimental.",
      description: `A transparência metodológica está madura, mas ainda sem flags oficiais de ${RADAR_OFFICIAL_RECORD_QAQC_NOTE}.`,
      nextStep: `Incorporar ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE} e log público de revisões.`
    },
    {
      axis: "Acionabilidade cívica",
      level: analyticsHealth,
      status: "O Radar já converte leitura em encaminhamentos, LAI e priorização territorial.",
      description: "O dado não termina na observação: ele já aponta pressão pública concreta.",
      nextStep: "Adicionar indicadores públicos de resposta institucional após cobrança."
    }
  ];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Maturidade pública do radar</div>
          <h3 className="text-lg font-black tracking-tight text-slate-900">
            {compact ? "Onde o Radar já é forte e onde ainda precisa evoluir" : "Placar de maturidade para padrão internacional de transparência"}
          </h3>
          <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
            Referência mundial não é só ter gráfico bonito. É mostrar, com honestidade, o que já está auditável, o que ainda é experimental e qual é o próximo salto institucional necessário.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
          transparência em evolução mensurável
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "lg:grid-cols-2" : "xl:grid-cols-4 md:grid-cols-2"}`}>
        {items.map((item) => {
          const tone = getToneClasses(item.level);
          return (
            <div key={item.axis} className={`rounded-[1.5rem] border p-4 ${tone.card}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{item.axis}</div>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${tone.badge}`}>
                  {item.level === "strong" ? "forte" : item.level === "advancing" ? "em avanço" : "experimental"}
                </span>
              </div>
              <p className="mt-2 text-[11px] font-black leading-relaxed text-slate-900">{item.status}</p>
              <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">{item.description}</p>
              {!compact && (
                <div className="mt-3 rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-[10px] font-semibold leading-relaxed text-slate-700">
                  Próximo salto: {item.nextStep}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
