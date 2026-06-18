import { useState, useMemo } from "react";
import { SectionHeader, SurfaceCard, IconShell } from "../BrandSystem";
import seedFindings from "../../../data/inea_historical_sources/seed-public-findings.json";
import { useRadarReleaseMetadata } from "../../data/air/useRadarReleaseMetadata";
import { RadarEvidenceStateBlock } from "../../pages/air/radar/RadarEvidenceStateBlock";

interface RawFinding {
  source_id: string;
  source_title: string;
  source_type: string;
  source_url: string;
  station_name: string;
  pollutant: string;
  metric: string;
  year: number | null;
  period_start: string | null;
  period_end: string | null;
  value: number;
  unit: string;
  representativeness: string;
  extraction_method: string;
  confidence: string;
  notes: string;
}

export function HistoricalRawEvidenceBox() {
  const releaseMetadata = useRadarReleaseMetadata();
  // Filters State
  const [pollutantFilter, setPollutantFilter] = useState<string>("");
  const [copiedLaiSummary, setCopiedLaiSummary] = useState<boolean>(false);

  const downloadCsv = () => {
    // Generate CSV headers
    const headers = [
      "ID",
      "Titulo da Fonte",
      "Tipo de Fonte",
      "URL",
      "Estacao",
      "Poluente",
      "Metrica",
      "Ano",
      "Inicio do Periodo",
      "Fim do Periodo",
      "Valor",
      "Unidade",
      "Representatividade",
      "Metodo de Extracao",
      "Confianca",
      "Notas"
    ];

    const rows = filteredFindings.map(f => [
      f.source_id,
      `"${f.source_title.replace(/"/g, '""')}"`,
      f.source_type,
      f.source_url,
      `"${f.station_name.replace(/"/g, '""')}"`,
      f.pollutant,
      f.metric,
      f.year || "",
      f.period_start || "",
      f.period_end || "",
      f.value,
      f.unit,
      f.representativeness,
      f.extraction_method,
      f.confidence,
      `"${f.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "inea-evidencias-fisicas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLaiSummary = async () => {
    const summaryHeader = "Resumo de Evidências de Medições Físicas em Volta Redonda (INEA):\n\n";
    const summaryLines = filteredFindings.map(f => {
      const period = f.year ? String(f.year) : `${f.period_start?.split("-")[0]}–${f.period_end?.split("-")[0]}`;
      return `- ${f.source_title} (${period}): Medição de ${f.pollutant} (${formatMetric(f.metric)}) com valor ${f.value} ${f.unit} na estação ${f.station_name}.`;
    }).join("\n");

    const finalText = summaryHeader + summaryLines + "\n\nSolicito o fornecimento dos microdados físicos originais completos que subsidiaram estes registros.";

    try {
      await navigator.clipboard.writeText(finalText);
      setCopiedLaiSummary(true);
      setTimeout(() => setCopiedLaiSummary(false), 2000);
    } catch (err) {
      console.error("Failed to copy summary:", err);
    }
  };
  const [stationFilter, setStationFilter] = useState<string>("");
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>("");
  const [metricFilter, setMetricFilter] = useState<string>("");
  const [periodFilter, setPeriodFilter] = useState<string>("");

  // Find RBCIAMB statistics for cards
  const pm10Mean = seedFindings.find(f => f.source_id === "rbciamb_2020_pm10_mean")?.value;
  const pm10Max = seedFindings.find(f => f.source_id === "rbciamb_2020_pm10_max")?.value;
  const ptsMean = seedFindings.find(f => f.source_id === "rbciamb_2020_pts_mean")?.value;
  const ptsMax = seedFindings.find(f => f.source_id === "rbciamb_2020_pts_max")?.value;
  const o3Mean = seedFindings.find(f => f.source_id === "rbciamb_2020_o3_mean")?.value;
  const o3Max = seedFindings.find(f => f.source_id === "rbciamb_2020_o3_max")?.value;
  const pm10Exceed = seedFindings.find(f => f.source_id === "rbciamb_2020_pm10_who_exceedance")?.value;
  const o3Exceed = seedFindings.find(f => f.source_id === "rbciamb_2020_o3_who_exceedance")?.value;

  // Find INEA Report 2015 data points
  const belmonteO3Max = seedFindings.find(f => f.source_id === "inea_rqar_2015_o3_belmonte_max")?.value;
  const santaCeciliaPtsMax = seedFindings.find(f => f.source_id === "inea_rqar_2015_pts_santa_cecilia_max")?.value;

  // Build filter options dynamically
  const uniquePollutants = useMemo(() => {
    return Array.from(new Set(seedFindings.map(f => f.pollutant)));
  }, []);

  const uniqueStations = useMemo(() => {
    const list: string[] = [];
    seedFindings.forEach(f => {
      f.station_name.split(",").forEach(s => {
        const trimmed = s.trim();
        if (trimmed && !list.includes(trimmed)) {
          list.push(trimmed);
        }
      });
    });
    return list;
  }, []);

  const uniqueSourceTypes = useMemo(() => {
    return Array.from(new Set(seedFindings.map(f => f.source_type)));
  }, []);

  const uniqueMetrics = useMemo(() => {
    return Array.from(new Set(seedFindings.map(f => f.metric)));
  }, []);

  const uniquePeriods = useMemo(() => {
    const list: string[] = [];
    seedFindings.forEach(f => {
      let p = "";
      if (f.year) p = String(f.year);
      else if (f.period_start && f.period_end) {
        const yStart = f.period_start.split("-")[0];
        const yEnd = f.period_end.split("-")[0];
        p = `${yStart}–${yEnd}`;
      }
      if (p && !list.includes(p)) {
        list.push(p);
      }
    });
    return list;
  }, []);

  // Filtered dataset
  const filteredFindings = useMemo(() => {
    return (seedFindings as RawFinding[]).filter(f => {
      if (pollutantFilter && f.pollutant !== pollutantFilter) return false;
      if (sourceTypeFilter && f.source_type !== sourceTypeFilter) return false;
      if (metricFilter && f.metric !== metricFilter) return false;
      
      if (stationFilter) {
        const stations = f.station_name.split(",").map(s => s.trim());
        if (!stations.includes(stationFilter)) return false;
      }
      
      if (periodFilter) {
        let p = "";
        if (f.year) p = String(f.year);
        else if (f.period_start && f.period_end) {
          const yStart = f.period_start.split("-")[0];
          const yEnd = f.period_end.split("-")[0];
          p = `${yStart}–${yEnd}`;
        }
        if (p !== periodFilter) return false;
      }

      return true;
    });
  }, [pollutantFilter, stationFilter, sourceTypeFilter, metricFilter, periodFilter]);

  const clearFilters = () => {
    setPollutantFilter("");
    setStationFilter("");
    setSourceTypeFilter("");
    setMetricFilter("");
    setPeriodFilter("");
  };

  // Helper formatting functions
  const formatSourceType = (type: string) => {
    switch (type) {
      case "SCIENTIFIC_ARTICLE":
        return "Artigo Científico";
      case "INEA_REPORT":
        return "Relatório Oficial INEA";
      case "DISSERTATION":
        return "Dissertação Acadêmica";
      case "IEMA_DIAGNOSTIC":
        return "Diagnóstico Técnico";
      default:
        return type;
    }
  };

  const formatMetric = (metric: string) => {
    switch (metric) {
      case "ANNUAL_MEAN":
        return "Média Anual";
      case "DAILY_MAX":
        return "Máximo Diário (24h)";
      case "HOURLY_MAX":
        return "Máximo Horário (1h)";
      case "DAILY_MEAN_SUMMARY":
        return "Resumo Média Diária";
      case "OMS_EXCEEDANCE_COUNT":
        return "Violações OMS";
      default:
        return metric;
    }
  };

  const formatPeriod = (f: RawFinding) => {
    if (f.year) return String(f.year);
    if (f.period_start && f.period_end) {
      const yStart = f.period_start.split("-")[0];
      const yEnd = f.period_end.split("-")[0];
      return `${yStart}–${yEnd}`;
    }
    return "-";
  };

  const formatConfidence = (conf: string) => {
    switch (conf) {
      case "HIGH":
        return "Alta";
      case "MEDIUM":
        return "Média";
      case "LOW":
        return "Baixa";
      default:
        return conf;
    }
  };

  return (
    <section className="space-y-8 pt-4" id="evidencias-brutas">
      <SectionHeader
        eyebrow="Rastros dos Dados Físicos"
        title="Rastros dos dados brutos"
        description={`A série completa ainda não está aberta em CSV, XLSX ou API no release ${releaseMetadata.cycleVersion}. Mas relatórios oficiais e pesquisas mostram que concentrações físicas foram medidas e usadas.`}
      />

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
          ciclo {releaseMetadata.cycleVersion}
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
          metodologia {releaseMetadata.methodologyVersion}
        </span>
        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-800">
          evidência externa
        </span>
      </div>

      <div className="p-4 bg-emerald-50/30 border border-emerald-500/10 rounded-2xl text-xs font-semibold text-emerald-900 leading-relaxed">
        ℹ️ Este mapeamento representa uma <strong>evidência pública forte de que medições físicas foram realizadas, agregadas e utilizadas</strong> no município de Volta Redonda nas últimas décadas, atestando a viabilidade de liberação das séries brutas completas pelo órgão ambiental.
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Card 1: Artigo Científico */}
        <SurfaceCard className="border border-brand-primary/10 bg-surface-1 p-5 rounded-2xl md:p-6 transition-all hover:border-brand-primary/20">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between">
              <IconShell tone="brand">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </IconShell>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary-soft px-2.5 py-1 rounded-full">
                Artigo 2013–2015
              </span>
            </div>
            
            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-black text-text-primary">
                Estudo de Internações (RBCIAMB)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Artigo científico da UFF publicado na <em>Revista Brasileira de Ciências Ambientais</em> que correlacionou a poluição do ar às internações por doenças respiratórias.
              </p>
              
              <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-tertiary block uppercase">PM₁₀ (Média / Max)</span>
                  <span className="text-xs font-black text-text-primary block">{pm10Mean} / {pm10Max} µg/m³</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-tertiary block uppercase">PTS (Média / Max)</span>
                  <span className="text-xs font-black text-text-primary block">{ptsMean} / {ptsMax} µg/m³</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-tertiary block uppercase">O₃ (Média / Max)</span>
                  <span className="text-xs font-black text-text-primary block">{o3Mean} / {o3Max} µg/m³</span>
                </div>
              </div>

              <div className="pt-2.5 text-xs font-semibold text-accent-red-dark space-y-1 bg-accent-red/5 p-3 rounded-xl border border-accent-red/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                  <span><strong>{pm10Exceed} violações</strong> das diretrizes da OMS para PM₁₀</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                  <span><strong>{o3Exceed} violações</strong> das diretrizes da OMS para O₃</span>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        {/* Card 2: Relatórios INEA */}
        <SurfaceCard className="border border-brand-primary/10 bg-surface-1 p-5 rounded-2xl md:p-6 transition-all hover:border-brand-primary/20">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between">
              <IconShell tone="brand">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </IconShell>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary-soft px-2.5 py-1 rounded-full">
                Relatórios INEA
              </span>
            </div>

            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-black text-text-primary">
                Relatórios Estaduais de Qualidade (RQAr)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Relatórios oficiais anuais editados pelo INEA registram a existência física e o monitoramento sistemático das estações de Volta Redonda em anos anteriores a 2022.
              </p>

              <div className="mt-4 pt-4 border-t border-border-subtle space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary"><strong>O₃ Máximo Horário</strong> (VR-Belmonte, 2015)</span>
                  <span className="font-black text-text-primary bg-surface-2 px-2.5 py-0.5 rounded border border-border-subtle">{belmonteO3Max} µg/m³</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary"><strong>PTS Máximo Diário</strong> (VR-Santa Cecília, 2015)</span>
                  <span className="font-black text-text-primary bg-surface-2 px-2.5 py-0.5 rounded border border-border-subtle">{santaCeciliaPtsMax} µg/m³</span>
                </div>
              </div>
              
              <p className="text-[10px] text-text-tertiary pt-2 leading-relaxed">
                *Nota: Os relatórios oficiais comprovam excedências aos limites nacionais, mas publicam apenas estatísticas anuais agregadas.
              </p>
            </div>
          </div>
        </SurfaceCard>

        {/* Card 3: Diagnóstico IEMA */}
        <SurfaceCard className="border border-brand-primary/10 bg-surface-1 p-5 rounded-2xl md:p-6 transition-all hover:border-brand-primary/20">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between">
              <IconShell tone="brand">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </IconShell>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary-soft px-2.5 py-1 rounded-full">
                IEMA 2000–2012
              </span>
            </div>

            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-black text-text-primary">
                1º Diagnóstico de Qualidade do Ar
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Documento técnico nacional compilado pelo Instituto de Energia e Meio Ambiente (IEMA) que audita a rede brasileira de monitoramento ambiental.
              </p>
              <div className="mt-4 pt-4 border-t border-border-subtle space-y-2 text-xs">
                <p className="text-text-secondary leading-relaxed">
                  ✓ Registra o histórico operacional das 3 estações fixas antigas de Volta Redonda.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  ✓ Mapeia a presença de analisadores automáticos de SO₂, CO, O₃ e NO₂ ativos na região do Médio Paraíba.
                </p>
              </div>
            </div>
          </div>
        </SurfaceCard>

        {/* Card 4: Dissertações UFF */}
        <SurfaceCard className="border border-brand-primary/10 bg-surface-1 p-5 rounded-2xl md:p-6 transition-all hover:border-brand-primary/20">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between">
              <IconShell tone="brand">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </IconShell>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary-soft px-2.5 py-1 rounded-full">
                Dissertações UFF
              </span>
            </div>

            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-black text-text-primary">
                Pesquisas Acadêmicas na UFF
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Trabalhos de mestrado em Saúde Coletiva e Engenharia Ambiental que fornecem uma <strong>evidência pública forte de que medições físicas foram realizadas, agregadas e utilizadas</strong> nas estações locais no triênio 2013-2015.
              </p>
              <div className="mt-4 pt-4 border-t border-border-subtle space-y-2 text-xs">
                <p className="text-text-secondary leading-relaxed">
                  ✓ Dissertação de Jéssica G. I. de Oliveira comprova que dados de concentração diária bruta circularam ativamente para modelagem de regressão epidemiológica.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  ✓ Demonstra correlação significativa entre picos de particulado e internações pediátricas e geriátricas no SUS.
                </p>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>

      {/* Info Blocks: OMS & Cautela */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Box: OMS */}
        <SurfaceCard className="border border-indigo-500/20 bg-indigo-50/40 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-indigo-950">
            <span className="shrink-0 text-indigo-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider">
              Por que isso importa para a OMS
            </h4>
          </div>
          <p className="text-xs text-indigo-900 leading-relaxed font-semibold">
            Para comparar plenamente com as diretrizes da OMS, precisamos da série bruta horária e diária completa. As evidências agregadas mostram que há medições físicas, mas não bastam para recalcular todas as médias e excedências, pois a OMS avalia o percentil de exposição diária e padrões anuais restritos.
          </p>
        </SurfaceCard>

        {/* Box: Cautela */}
        <SurfaceCard className="border border-amber-500/20 bg-amber-50/40 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-950">
            <span className="shrink-0 text-amber-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <h4 className="text-xs font-black uppercase tracking-wider">
              Bloco de Cautela Didática
            </h4>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-semibold">
            Esta tabela não substitui a série bruta horária/diária completa. Ela mostra apenas evidências públicas agregadas já compiladas em relatórios oficiais e estudos científicos pontuais, reforçando a cobrança pela abertura completa da série.
          </p>
        </SurfaceCard>
      </div>

      {/* Interactive Table Panel */}
      <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-slate-50">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Tabela de Concentrações Físicas Garimpadas
            </h3>
            <p className="text-xs text-slate-400 font-semibold">
              Filtre os registros agregados para conferir os valores medidos nas estações antes de 2022.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition-all shadow-xs"
              title="Baixar a tabela de evidências em formato CSV para uso em denúncia ou LAI"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Baixar evidências em CSV</span>
            </button>
            <button
              onClick={copyLaiSummary}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white font-bold rounded-lg text-xs transition-all shadow-xs ${copiedLaiSummary ? "bg-emerald-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
              title="Copiar lista de dados filtrados para usar como justificativa em um pedido de LAI"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>{copiedLaiSummary ? "Copiado!" : "Copiar resumo para LAI"}</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
          {/* Filter Pollutant */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase block">Poluente</label>
            <select
              value={pollutantFilter}
              onChange={(e) => setPollutantFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 font-semibold text-slate-700 outline-none focus:border-brand-primary"
            >
              <option value="">Todos</option>
              {uniquePollutants.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Filter Station */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase block">Estação</label>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 font-semibold text-slate-700 outline-none focus:border-brand-primary"
            >
              <option value="">Todas</option>
              {uniqueStations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Filter Source Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase block">Tipo de Fonte</label>
            <select
              value={sourceTypeFilter}
              onChange={(e) => setSourceTypeFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 font-semibold text-slate-700 outline-none focus:border-brand-primary"
            >
              <option value="">Todos</option>
              {uniqueSourceTypes.map(t => <option key={t} value={t}>{formatSourceType(t)}</option>)}
            </select>
          </div>

          {/* Filter Metric */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase block">Métrica</label>
            <select
              value={metricFilter}
              onChange={(e) => setMetricFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 font-semibold text-slate-700 outline-none focus:border-brand-primary"
            >
              <option value="">Todas</option>
              {uniqueMetrics.map(m => <option key={m} value={m}>{formatMetric(m)}</option>)}
            </select>
          </div>

          {/* Filter Period */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase block">Período/Ano</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 font-semibold text-slate-700 outline-none focus:border-brand-primary"
            >
              <option value="">Todos</option>
              {uniquePeriods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(pollutantFilter || stationFilter || sourceTypeFilter || metricFilter || periodFilter) && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Results Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="min-w-full divide-y divide-slate-100 text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider">Fonte</th>
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider">Período</th>
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider">Estação</th>
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider text-center">Poluente</th>
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider">Métrica</th>
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider text-right">Valor</th>
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider">Unidade</th>
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider">Tipo Fonte</th>
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider text-center">Confiança</th>
                <th scope="col" className="px-4 py-2.5 font-black uppercase text-slate-400 text-[10px] tracking-wider max-w-[200px]">Limitação / Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white font-semibold text-slate-700">
              {filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum registro histórico atende aos filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredFindings.map((f) => (
                  <tr key={f.source_id} className="hover:bg-slate-50/20">
                    <td className="px-4 py-3 font-bold text-slate-900 max-w-[180px] truncate" title={f.source_title}>
                      <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-primary">
                        {f.source_title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatPeriod(f)}</td>
                    <td className="px-4 py-3 max-w-[150px] truncate" title={f.station_name}>{f.station_name}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{f.pollutant}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatMetric(f.metric)}</td>
                    <td className="px-4 py-3 text-right font-black text-slate-800 text-sm">{f.value}</td>
                    <td className="px-4 py-3 text-slate-500">{f.unit}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatSourceType(f.source_type)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${f.confidence === "HIGH" ? "bg-emerald-50 text-emerald-800 border border-emerald-200/30" : "bg-amber-50 text-amber-800 border border-amber-200/30"}`}>
                        {formatConfidence(f.confidence)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-normal leading-normal max-w-[200px]" title={f.notes}>
                      {f.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <RadarEvidenceStateBlock
          state="external"
          title="Rastro documental robusto, ainda sem microdado integral aberto"
          description={`Esta tabela prova que medições físicas e agregados históricos existiram e circularam em relatórios e estudos, fortalecendo a cobrança pública no release ${releaseMetadata.cycleVersion}. Ainda assim, ela permanece como evidência externa enquanto a série microdado completa não estiver aberta com contrato operacional explícito.`}
        />
      </SurfaceCard>
    </section>
  );
}
