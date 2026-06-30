import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AIR_PUBLIC_DOWNLOADS, getAirPublicDataPath } from "../../../data/air/public-downloads";
import {
  RADAR_EXPERIMENTAL_OBSERVATION_NOTE,
  RADAR_NO_DATA_NOT_CLEAN_AIR,
  RADAR_PUBLIC_INTEREST_SUMMARY
} from "../../../data/air/radar-copy";
import { useRadarReleaseMetadata } from "../../../data/air/useRadarReleaseMetadata";
import { RadarConfidenceSnapshot } from "./RadarConfidenceSnapshot";
import { RadarModeFooter } from "./RadarModeFooter";
import { fetchRadarJson } from "./radarApi";
import type { RadarComparisonTab, RadarMode, StationMetadataItem, SummaryStats } from "./RadarTypes";

interface RadarMethodologyModeProps {
  displaySummary: SummaryStats;
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onOpenLai: () => void;
  stationMetadata: StationMetadataItem[];
  onTop: () => void;
}

interface ExportCatalogYearPartition {
  year: number;
  from: string;
  to: string;
  url: string;
}

interface ExportCatalogStationPartition {
  station_id: string;
  station_name: string;
  city: string | null;
  neighborhood: string | null;
  url: string;
}

interface ExportCatalogResponse {
  available_years?: {
    partitions?: ExportCatalogYearPartition[];
  };
  available_stations?: ExportCatalogStationPartition[];
}

const READING_STEPS = [
  {
    eyebrow: "1",
    title: "Escolha a pergunta",
    text: "Antes de olhar número, defina se a dúvida é sobre tempo, território, estação, poluente ou lacuna de transparência."
  },
  {
    eyebrow: "2",
    title: "Confira a base",
    text: "Veja se o dado veio de IQAr/Dados Abertos, WebLakes horário ou arquivo derivado SEMEAR. Cada fonte sustenta um tipo de conclusão."
  },
  {
    eyebrow: "3",
    title: "Cheque cobertura",
    text: "Sem cobertura suficiente, a leitura vira sinal de atenção, não conclusão forte. Ausência de dado não significa ar bom."
  },
  {
    eyebrow: "4",
    title: "Só então cobre ação",
    text: "Transforme o achado em pedido claro: manutenção, QA/QC, expansão da rede, resposta institucional ou abertura de série."
  }
];

const EVIDENCE_LEVELS = [
  {
    title: "Prova publicada",
    tone: "emerald",
    text: "Há artefato público verificável: metodologia, manifesto, CSV, catálogo ou rota auditável. Serve para reprodução independente."
  },
  {
    title: "Prova parcial",
    tone: "sky",
    text: "A leitura é útil, mas ainda depende de cobertura, inferência controlada, cadeia pública incompleta ou ausência de QA/QC por registro."
  },
  {
    title: "Prova externa",
    tone: "violet",
    text: "A referência vem de relatório, literatura ou memória técnica. Ajuda a contextualizar, mas não vira camada operacional sozinha."
  },
  {
    title: "Prova ausente",
    tone: "amber",
    text: "Falta artefato mínimo para publicar como evidência forte. A resposta correta é pedir dados, não preencher lacuna com suposição."
  }
];

const PUBLIC_ACTIONS = [
  {
    title: "Pedir QA/QC por registro",
    text: "Solicitar flags oficiais de validação por observação para separar dado bruto, dado validado e dado suspeito."
  },
  {
    title: "Cobrar metadados da malha",
    text: "Publicar janela operacional, manutenção e status de cada estação para reduzir inferência editorial."
  },
  {
    title: "Abrir séries completas",
    text: "Disponibilizar histórico em formato aberto, com unidade, estação, período e dicionário de dados."
  }
];

function formatDate(value?: string | null) {
  if (!value) return "indisponível";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "indisponível";
  return parsed.toLocaleDateString("pt-BR");
}

function evidenceClasses(tone: string) {
  if (tone === "emerald") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (tone === "sky") return "border-sky-200 bg-sky-50 text-sky-950";
  if (tone === "violet") return "border-violet-200 bg-violet-50 text-violet-950";
  return "border-amber-200 bg-amber-50 text-amber-950";
}

export function RadarMethodologyMode({ displaySummary, onNavigate, onOpenLai, stationMetadata, onTop }: RadarMethodologyModeProps) {
  const releaseMetadata = useRadarReleaseMetadata();
  const [exportCatalog, setExportCatalog] = useState<ExportCatalogResponse | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      try {
        setCatalogError(null);
        const response = await fetchRadarJson<ExportCatalogResponse>("/api/air/inea/export-catalog");
        if (active) setExportCatalog(response);
      } catch (error) {
        if (active) {
          setCatalogError(error instanceof Error ? error.message : "Não foi possível carregar o catálogo público de partições.");
        }
      }
    };

    void loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  const totalStations = stationMetadata.length || displaySummary.totalStations || 0;
  const activeStations = stationMetadata.filter((item) => item.active).length;
  const latestDate = formatDate(displaySummary.latest_measured_at || displaySummary.latest_ingested_at);
  const topYearPartitions = exportCatalog?.available_years?.partitions?.slice(0, 4) ?? [];
  const topStationPartitions = exportCatalog?.available_stations?.slice(0, 4) ?? [];

  return (
    <div className="animate-fade-in space-y-8 pt-4">
      <section className="overflow-hidden rounded-[2.25rem] border border-sky-100 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_34%),linear-gradient(135deg,#ffffff,#f8fafc_58%,#ecfeff)] p-6 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.45)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr),minmax(20rem,0.95fr)] lg:items-end">
          <div className="min-w-0 space-y-4">
            <div className="inline-flex rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-800">
              Guia público do Radar INEA
            </div>
            <div className="space-y-3">
              <h2 className="max-w-3xl text-3xl font-black leading-[0.95] tracking-[-0.045em] text-slate-950 md:text-5xl lg:text-[3.15rem]">
                Leia o Radar sem transformar dado público em conclusão indevida.
              </h2>
              <p className="max-w-2xl text-sm font-bold leading-relaxed text-slate-700 md:text-base">
                Esta página agora funciona como roteiro de uso: explica origem, força da evidência, limites e caminhos de auditoria. O objetivo é ajudar qualquer pessoa a entender o que o portal sustenta e o que ainda precisa ser cobrado.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
                ciclo {releaseMetadata.cycleVersion}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800">
                metodologia {releaseMetadata.methodologyVersion}
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-800">
                dataset {releaseMetadata.datasetVersion}
              </span>
            </div>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">O que já é forte</div>
              <div className="mt-2 text-2xl font-black text-emerald-950">Auditável</div>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-emerald-900/80">
                Manifesto, CSVs e metodologia permitem reprodução fora da interface.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Cautela central</div>
              <div className="mt-2 text-2xl font-black text-amber-950">QA/QC</div>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-900/80">
                Parte das leituras públicas não traz QA/QC oficial por observação.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-sky-200 bg-white/85 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">Malha nesta carga</div>
              <div className="mt-2 text-2xl font-black text-sky-950">{activeStations || totalStations || "--"}</div>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-sky-900/80">
                estações na leitura pública disponível.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Última base</div>
              <div className="mt-2 text-2xl font-black text-slate-950">{latestDate}</div>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">
                última medição ou ingestão pública disponível.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)] md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Roteiro pedagógico</div>
            <h3 className="text-xl font-black tracking-tight text-slate-950">Como usar sem pular etapas de confiança</h3>
            <p className="max-w-3xl text-xs font-semibold leading-relaxed text-slate-600">
              Use esta ordem antes de citar qualquer número fora do portal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("OVERVIEW")}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-950 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-sky-800"
          >
            Voltar à visão geral
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {READING_STEPS.map((item) => (
            <article key={item.eyebrow} className="group rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-100 text-sm font-black text-sky-800">
                {item.eyebrow}
              </div>
              <h4 className="mt-4 text-sm font-black text-slate-950">{item.title}</h4>
              <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <RadarConfidenceSnapshot compact summary={displaySummary} stationMetadata={stationMetadata} />

      <section className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">De onde vem</div>
          <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">Duas bases diferentes, duas leituras diferentes</h3>
          <div className="mt-5 space-y-3">
            <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4">
              <h4 className="text-sm font-black text-sky-950">INEA/WebLakes</h4>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-sky-900/80">
                Leituras públicas horárias de concentração física. Servem para médias, picos, cobertura e comparação experimental.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
              <h4 className="text-sm font-black text-emerald-950">Dados Abertos RJ / IQAr</h4>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-emerald-900/80">
                Índices e subíndices oficiais em planilha pública. IQAr é adimensional e não deve ser confundido com µg/m³ ou ppm.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
              <h4 className="text-sm font-black text-amber-950">Arquivos SEMEAR</h4>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-amber-900/80">
                CSVs, manifesto, catálogo e dicionário tornam a análise reprodutível, mas não criam medição própria.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Taxonomia simples</div>
              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">O que cada evidência consegue sustentar</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
              sem ambiguidade
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {EVIDENCE_LEVELS.map((item) => (
              <article key={item.title} className={`rounded-[1.5rem] border p-4 ${evidenceClasses(item.tone)}`}>
                <h4 className="text-[11px] font-black uppercase tracking-[0.16em]">{item.title}</h4>
                <p className="mt-2 text-[11px] font-semibold leading-relaxed opacity-85">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc_55%,#f0fdf4)] p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)] md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr,0.9fr]">
          <div className="space-y-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Auditoria e downloads</div>
              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">Baixe, confira e reproduza a leitura</h3>
              <p className="mt-2 max-w-3xl text-xs font-semibold leading-relaxed text-slate-600">
                A transparência forte está nos artefatos: manifesto, CSV, catálogo, dicionário e metodologia. Não cite número isolado sem estação, período, unidade e cobertura.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {AIR_PUBLIC_DOWNLOADS.slice(0, 4).map((item) => (
                <a
                  key={item.file}
                  href={getAirPublicDataPath(item.file)}
                  download={item.file.endsWith(".csv") ? item.file : undefined}
                  className="rounded-[1.4rem] border border-emerald-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-30px_rgba(15,23,42,0.35)]"
                >
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-700">{item.format}</div>
                  <div className="mt-2 text-sm font-black text-slate-950">{item.title}</div>
                  <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-600">{item.desc}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-slate-200 bg-white/80 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Catálogo público</div>
            {catalogError ? (
              <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[11px] font-semibold leading-relaxed text-amber-900">
                Catálogo indisponível nesta carga: {catalogError}
              </p>
            ) : (
              <div className="mt-3 grid gap-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900">Partições anuais</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {topYearPartitions.length > 0 ? topYearPartitions.map((partition) => (
                      <a key={partition.year} href={partition.url} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black text-slate-700 hover:border-sky-300">
                        {partition.year}
                      </a>
                    )) : (
                      <span className="text-[11px] font-semibold text-slate-500">Sem partições anuais carregadas.</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Partições por estação</h4>
                  <div className="mt-2 space-y-2">
                    {topStationPartitions.length > 0 ? topStationPartitions.map((partition) => (
                      <a key={partition.station_id} href={partition.url} className="block rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-700 hover:border-emerald-300">
                        {partition.station_name}
                      </a>
                    )) : (
                      <span className="text-[11px] font-semibold text-slate-500">Sem partições por estação carregadas.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="/api/air/inea/export-manifest" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-2xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">
                Manifesto
              </a>
              <a href="/api/air/inea/export?metricType=GENERAL_AQI" className="inline-flex min-h-10 items-center rounded-2xl bg-slate-950 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                CSV bruto
              </a>
              <Link to="/qualidade-ar/inea/metodologia#dicionario" className="inline-flex min-h-10 items-center rounded-2xl border border-slate-200 bg-white px-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">
                Dicionário
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid items-start gap-4 xl:grid-cols-[0.85fr,1.15fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Limites de uso</div>
          <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">O que o Radar não pode prometer</h3>
          <div className="mt-4 space-y-3 text-[12px] font-semibold leading-relaxed text-slate-650">
            <p>{RADAR_PUBLIC_INTEREST_SUMMARY}</p>
            <p>Comparações com OMS e CONAMA devem ser lidas como apoio cívico e metodológico quando não houver {RADAR_EXPERIMENTAL_OBSERVATION_NOTE}.</p>
            <p>{RADAR_NO_DATA_NOT_CLEAN_AIR}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={onOpenLai} className="inline-flex min-h-11 items-center rounded-2xl bg-emerald-500 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-950 hover:bg-emerald-400">
              Abrir minuta de LAI
            </button>
            <Link to="/qualidade-ar/inea/metodologia" className="inline-flex min-h-11 items-center rounded-2xl border border-slate-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 hover:bg-slate-50">
              Metodologia completa
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-amber-200 bg-[linear-gradient(180deg,#fffdf3,#ffffff)] p-5 shadow-[0_20px_45px_-36px_rgba(15,23,42,0.35)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">O que cobrar agora</div>
          <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">Três pedidos públicos que fortalecem o Radar</h3>
          <div className="mt-4 grid gap-3">
            {PUBLIC_ACTIONS.map((item) => (
              <article key={item.title} className="rounded-[1.4rem] border border-amber-200 bg-white p-4">
                <h4 className="text-sm font-black text-slate-950">{item.title}</h4>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={onOpenLai} className="inline-flex min-h-11 items-center rounded-2xl bg-amber-400 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-amber-950 hover:bg-amber-300">
              Usar minuta de LAI
            </button>
            <button onClick={() => onNavigate("STATIONS")} className="inline-flex min-h-11 items-center rounded-2xl border border-amber-200 bg-white px-4 text-[10px] font-black uppercase tracking-[0.16em] text-amber-900 hover:bg-amber-50">
              Ver estações
            </button>
          </div>
        </div>
      </section>

      <RadarModeFooter
        nextStep="Próximo passo recomendado: volte à visão geral e aplique esta régua ao ler rankings, séries e cobertura."
        primaryLabel="Voltar à Visão Geral →"
        onPrimary={() => onNavigate("OVERVIEW")}
        onTop={onTop}
      />
    </div>
  );
}
