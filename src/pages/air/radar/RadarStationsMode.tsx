import { Link } from "react-router-dom";
import { useMemo } from "react";

import { SurfaceCard } from "../../../components/BrandSystem";
import { RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import { scoreStationGovernance } from "./RadarGovernanceModel";
import { RadarNextReadingCard } from "./RadarNextReadingCard";
import { RadarStationConfidenceCard } from "./RadarStationConfidenceCard";
import type { LatestResult, RadarComparisonTab, RadarMode, StationMetadataItem } from "./RadarTypes";
import { RadarMicroguide } from "./RadarMicroguide";
import { RadarModeFooter } from "./RadarModeFooter";

interface RadarStationsModeProps {
  latestData: LatestResult[];
  stationMetadata: StationMetadataItem[];
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onTop: () => void;
}

function getStationDescription(station: LatestResult["station"]) {
  const normalized = station.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  if (normalized.includes("belmonte")) {
    return "Estação oficial do INEA com cobertura relevante para leitura da borda oeste industrial e residencial de Volta Redonda.";
  }

  if (normalized.includes("retiro")) {
    return "Estação oficial do INEA posicionada em área residencial do Retiro, útil para leitura de exposição cotidiana da população.";
  }

  if (normalized.includes("santa cecilia")) {
    return "Estação oficial do INEA em zona urbana central, importante para acompanhar a mistura atmosférica em área de circulação intensa.";
  }

  if (normalized.includes("aguas cruas")) {
    return "Estação da rede INEA voltada à camada meteorológica, relevante para contexto de dispersão e direção dos ventos.";
  }

  return "Estação oficial listada na base pública integrada ao Radar INEA.";
}

export function RadarStationsMode({ latestData, stationMetadata, onNavigate, onTop }: RadarStationsModeProps) {
  const stations = useMemo(
    () =>
      [...latestData].sort((a, b) => {
        if (a.station.active !== b.station.active) {
          return a.station.active ? -1 : 1;
        }
        return a.station.name.localeCompare(b.station.name, "pt-BR");
      }),
    [latestData]
  );

  const stationMetadataMap = useMemo(
    () => new Map(stationMetadata.map((item) => [item.station_id, item])),
    [stationMetadata]
  );
  const governanceSummary = useMemo(() => {
    const scored = stationMetadata.map((item) => scoreStationGovernance(item));
    return {
      strong: scored.filter((item) => item.level === "strong").length,
      advancing: scored.filter((item) => item.level === "advancing").length,
      experimental: scored.filter((item) => item.level === "experimental").length
    };
  }, [stationMetadata]);

  return (
    <div className="animate-fade-in space-y-8 pt-4">
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800">
          <span>📡 Detalhes das Estações Operacionais</span>
        </h2>
        <p className="text-sm font-medium text-slate-600">
          Informações detalhadas sobre a localização física, parâmetros de monitoramento e contexto de cada estação em Volta Redonda.
        </p>
        <p className="text-xs font-bold text-brand-primary">
          💡 Este modo responde: Qual é a situação técnica de cada estação de monitoramento física e onde elas estão instaladas?
        </p>
      </div>

      <RadarMicroguide
        whatYouSee="Ficha técnica detalhada com coordenadas, status e histórico operacional de cada estação."
        howToRead="Confira a localização física e o status operacional (ativa/inativa) de cada sensor oficial."
        whyItMatters="Permite validar a transparência e a abrangência geográfica da cobertura instrumental no município."
      />

      <div className="grid gap-3 md:grid-cols-2">
        <RadarEvidenceStateBlock
          state={stations.length > 0 ? "published" : "missing"}
          description={
            stations.length > 0
              ? "A malha de estações, coordenadas, status e páginas individuais já está publicada para escrutínio cívico e técnico."
              : "Sem estações carregadas, este modo não consegue demonstrar cobertura instrumental mínima nesta consulta."
          }
        />
        <RadarEvidenceStateBlock
          state={stationMetadata.length > 0 ? "partial" : "missing"}
          description={
            stationMetadata.length > 0
              ? "Os metadados já ajudam a explicitar operação e confiança, mas ainda não equivalem a publicação oficial completa de manutenção, QA/QC e histórico por observação."
              : "Sem metadados operacionais, a infraestrutura publicada perde parte importante da sua auditabilidade."
          }
        />
      </div>

      {stationMetadata.length > 0 && (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Malha forte</div>
            <div className="mt-2 text-2xl font-black text-emerald-950">{governanceSummary.strong}</div>
            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-emerald-900/80">
              estações com metadata mais explícita e leitura pública mais defensável.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-sky-200 bg-sky-50/70 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Malha em avanço</div>
            <div className="mt-2 text-2xl font-black text-sky-950">{governanceSummary.advancing}</div>
            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-sky-900/80">
              estações úteis para auditoria, ainda com lacunas de lastro operacional público.
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/70 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Malha cautelar</div>
            <div className="mt-2 text-2xl font-black text-amber-950">{governanceSummary.experimental}</div>
            <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-900/80">
              estações ainda mais dependentes de inferência ou metadata incompleta.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {stations.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
            Nenhuma estação pôde ser carregada da base pública nesta consulta.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stations.map((item) => {
              const { station, measured_at } = item;
              const metadata = stationMetadataMap.get(station.id) || null;

              return (
                <SurfaceCard
                  key={station.id}
                  className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {station.code || "SEM CÓDIGO"}
                        </span>
                        <h3 className="text-sm font-black text-slate-800">{station.name}</h3>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
                          station.active
                            ? "border border-emerald-500/20 bg-emerald-50 text-emerald-700"
                            : "border border-slate-200 bg-slate-100 text-slate-500"
                        }`}
                      >
                        {station.active ? "Operacional" : "Inativa"}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold leading-relaxed text-slate-500">{getStationDescription(station)}</p>

                    <RadarStationConfidenceCard compact stationMetadata={metadata} />

                    <div className="space-y-1.5 border-t border-slate-50 pt-2 text-[10px] font-bold text-slate-600">
                      <div className="flex justify-between gap-3">
                        <span>Território:</span>
                        <span className="text-right text-slate-800">{station.neighborhood || station.city || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latitude:</span>
                        <span className="text-slate-800">{station.lat ? station.lat.toFixed(6) : "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Longitude:</span>
                        <span className="text-slate-800">{station.lng ? station.lng.toFixed(6) : "-"}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Última leitura:</span>
                        <span className="text-right text-slate-800">
                          {measured_at ? new Date(measured_at).toLocaleString("pt-BR") : "Sem leitura pública"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <Link
                      to={`/qualidade-ar/inea/estacoes/${station.id}`}
                      className="inline-flex min-h-[34px] w-full items-center justify-center rounded-xl bg-slate-800 text-xs font-black text-white transition-all hover:bg-slate-700"
                    >
                      Acessar Série Completa →
                    </Link>
                  </div>
                </SurfaceCard>
              );
            })}
          </div>
        )}
      </div>

      <RadarNextReadingCard
        eyebrow="Próxima leitura recomendada"
        title="Depois de localizar a infraestrutura, audite se ela sustenta a leitura pública que o Radar está propondo."
        description="Agora que você viu quais estações existem e quão explícitas são suas janelas operacionais, o próximo passo é abrir a metodologia para entender regras de liberação pública, confiança e limites de cada camada."
        caution="Rede publicada sem regra metodológica clara ainda não basta para confiança pública robusta."
        primary={{ label: "Abrir metodologia", mode: "METHODOLOGY" }}
        secondary={{ label: "Voltar à cobertura", mode: "TIME", tab: "COVERAGE" }}
        onNavigate={onNavigate}
      />

      <RadarModeFooter
        nextStep="Próximo passo recomendado: Consulte as notas de metodologia, gases e baixe os dados abertos."
        primaryLabel="Ver Metodologia e Downloads →"
        onPrimary={() => onNavigate("METHODOLOGY")}
        onTop={onTop}
      />
    </div>
  );
}
