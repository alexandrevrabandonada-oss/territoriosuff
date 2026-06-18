import { getEvidenceStateLabel } from "./RadarEvidenceStateBlock";
import {
  PARAMETER_GOVERNANCE_ITEMS,
  scoreParameterGovernance,
  scoreStationGovernance,
  type StationGovernanceLevel
} from "./RadarGovernanceModel";
import type { StationMetadataItem } from "./RadarTypes";

interface RadarGovernanceScoreboardProps {
  stationMetadata: StationMetadataItem[];
}

function getStationLevelLabel(level: StationGovernanceLevel) {
  switch (level) {
    case "strong":
      return "forte";
    case "advancing":
      return "em avanço";
    default:
      return "experimental";
  }
}

function getStationLevelClasses(level: StationGovernanceLevel) {
  switch (level) {
    case "strong":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "advancing":
      return "border-sky-200 bg-sky-50 text-sky-800";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

export function RadarGovernanceScoreboard({ stationMetadata }: RadarGovernanceScoreboardProps) {
  const scoredStations = stationMetadata
    .map((item) => ({
      station: item,
      ...scoreStationGovernance(item)
    }))
    .sort((a, b) => a.score - b.score || a.station.station_name.localeCompare(b.station.station_name, "pt-BR"));

  const strongStations = scoredStations.filter((item) => item.level === "strong").length;
  const advancingStations = scoredStations.filter((item) => item.level === "advancing").length;
  const experimentalStations = scoredStations.filter((item) => item.level === "experimental").length;

  const scoredParameters = PARAMETER_GOVERNANCE_ITEMS.map((item) => ({
    item,
    ...scoreParameterGovernance(item)
  })).sort((a, b) => b.score - a.score || a.item.parameter.localeCompare(b.item.parameter, "pt-BR"));

  const operationalParameters = scoredParameters.filter((item) => item.score >= 60).length;
  const cautionParameters = scoredParameters.filter((item) => item.score >= 40 && item.score < 60).length;
  const blockedParameters = scoredParameters.filter((item) => item.score < 40).length;
  const lowestStations = scoredStations.slice(0, 3);

  return (
    <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]">
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Régua comparável de governança</div>
        <h3 className="text-lg font-black tracking-tight text-slate-900">Quanto cada parte do Radar já está pronta para confiança pública forte</h3>
        <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
          Esta matriz transforma governança em critério reproduzível. Cada estação recebe score por explicitude operacional e cada parâmetro recebe score por maturidade de uso e força da prova publicada.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Estações fortes</div>
          <div className="mt-2 text-2xl font-black text-emerald-950">{strongStations}</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-emerald-900/80">
            estações com janela explícita, lastro publicado e condição operacional mais defensável.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50/70 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Estações em avanço</div>
          <div className="mt-2 text-2xl font-black text-sky-950">{advancingStations}</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-sky-900/80">
            estações com parte importante do lastro público já exposta, mas ainda sem fechamento completo.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/70 p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Parâmetros operáveis</div>
          <div className="mt-2 text-2xl font-black text-amber-950">{operationalParameters}</div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-900/80">
            camadas já úteis para leitura pública comparativa, ainda que com cautela metodológica declarada.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.22)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Ranking de prontidão por estação</div>
              <h4 className="mt-1 text-base font-black text-slate-900">Onde a malha já está forte e onde ainda pede reforço</h4>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
              {experimentalStations} em faixa experimental
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {scoredStations.length > 0 ? (
              scoredStations.map((item) => (
                <div key={item.station.station_id} className="rounded-[1.3rem] border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                        {item.station.station_code || item.station.station_id}
                      </div>
                      <div className="mt-1 text-sm font-black text-slate-900">{item.station.station_name}</div>
                      <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">
                        {item.station.neighborhood || item.station.city || "Território não publicado"} · {item.station.active ? "estação ativa" : "estação inativa"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${getStationLevelClasses(item.level)}`}>
                        {getStationLevelLabel(item.level)}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-700">
                        score {item.score}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-white bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">
                      Janela: {item.hasExplicitWindow ? "explícita" : "inferida"}
                    </div>
                    <div className="rounded-xl border border-white bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">
                      Datas: {item.hasPublishedWindowBounds ? "publicadas" : "incompletas"}
                    </div>
                    <div className="rounded-xl border border-white bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">
                      Fonte: {item.hasPublishedSource ? "explícita" : "ausente"}
                    </div>
                    <div className="rounded-xl border border-white bg-white px-3 py-2 text-[10px] font-semibold text-slate-700">
                      Notas: {item.hasProvenanceNotes ? "publicadas" : "ausentes"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] font-semibold leading-relaxed text-slate-500">Sem metadados de estação carregados, a régua comparável da malha ainda não pode ser calculada.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_14px_30px_-26px_rgba(15,23,42,0.22)]">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Carteira de parâmetros</div>
            <h4 className="mt-1 text-base font-black text-slate-900">Prontidão pública por camada analítica</h4>
            <div className="mt-4 space-y-3">
              {scoredParameters.map((entry) => (
                <div key={entry.item.parameter} className="rounded-[1.3rem] border border-slate-200 bg-slate-50/80 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-slate-900">{entry.item.parameter}</div>
                      <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">{entry.item.scope}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-700">
                      score {entry.score}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-700">
                      {entry.item.status}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-700">
                      {getEvidenceStateLabel(entry.evidenceState)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Fila de reforço prioritário</div>
            <div className="mt-3 space-y-3">
              <div className="rounded-2xl border border-white bg-white px-3 py-3 text-[11px] font-semibold leading-relaxed text-slate-700">
                {blockedParameters} parâmetros seguem fora da faixa operacional robusta e exigem blindagem metodológica antes de qualquer expansão pública.
              </div>
              <div className="rounded-2xl border border-white bg-white px-3 py-3 text-[11px] font-semibold leading-relaxed text-slate-700">
                {cautionParameters} parâmetros estão em faixa intermediária: já ajudam a leitura pública, mas ainda pedem prova adicional ou regra de uso mais rígida.
              </div>
              {lowestStations.length > 0 && (
                <div className="rounded-2xl border border-white bg-white px-3 py-3 text-[11px] font-semibold leading-relaxed text-slate-700">
                  Menor prontidão da malha nesta rodada: {lowestStations.map((item) => `${item.station.station_name} (${item.score})`).join(" · ")}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
