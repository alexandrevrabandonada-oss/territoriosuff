import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { MethodologyNotice } from "../../components/air/MethodologyNotice";
import { DataFreshnessNotice } from "../../components/air/DataFreshnessNotice";
import { IneaHistoricalTimeline } from "../../components/air/IneaHistoricalTimeline";
import { AqiExplainer } from "../../components/air/AqiExplainer";

interface StationInfo {
  id: string;
  name: string;
  code: string;
  lat: number | null;
  lng: number | null;
}

interface SummaryStats {
  totalStations: number;
  totalMeasurements: number;
  timeRange: { minDate: string; maxDate: string };
  latest_ingested_at?: string | null;
}

const STATIC_STATIONS = [
  {
    name: "VR-Belmonte",
    lat: -22.517677,
    lng: -44.13254,
    description: "Estação oficial presente na base pública do INEA."
  },
  {
    name: "VR-Retiro",
    lat: -22.502349,
    lng: -44.12281,
    description: "Estação oficial presente na base pública do INEA."
  },
  {
    name: "VR-Santa Cecília",
    lat: -22.52253,
    lng: -44.106564,
    description: "Estação oficial presente na base pública do INEA."
  },
  {
    name: "VR-Nossa Sra. das Graças (Van)",
    lat: -22.50656,
    lng: -44.09669,
    description: "Estação oficial presente na base pública do INEA."
  }
];

const LAI_TEMPLATE = `Prezados,

Com amparo na Lei Federal de Acesso à Informação (Lei nº 12.527/2011) e na Lei Estadual do Rio de Janeiro nº 9.176/2021 (que rege as obrigações de transparência ativa), solicito o fornecimento, em formato aberto, estruturado e legível por máquina (como CSV, XLSX ou equivalente), da série histórica de dados de monitoramento de qualidade do ar obtidos pelas estações automáticas oficiais localizadas no município de Volta Redonda/RJ.

Especificamente, requerem-se as informações conforme as seguintes especificações:

1. Estações Monitoradas:
   - VR-Retiro (localização aproximada: Av. Jaraguá, nº 800, bairro Retiro - Lat: -22.502349, Long: -44.122810);
   - VR-Belmonte (localização aproximada: Bairro Belmonte - Lat: -22.517677, Long: -44.132540);
   - VR-Santa Cecília (localização aproximada: Av. Vinte e Um, Vila Santa Cecília - Lat: -22.522530, Long: -44.106564).

2. Período dos Dados:
   - De 01 de janeiro de 2010 (ou desde a data de instalação/início de operação de cada estação, caso posterior) até 31 de dezembro de 2021.

3. Variáveis e Parâmetros Requeridos:
   - Registros com resolução temporal de médias horárias e médias diárias contendo:
     - Concentrações físicas dos poluentes monitorados em suas respectivas unidades físicas de medida (µg/m³ ou ppm), incluindo Material Particulado (MP10 e MP2.5), Dióxido de Enxofre (SO2), Dióxido de Nitrogênio (NO2), Ozônio (O3) e Monóxido de Carbono (CO);
     - Subíndices de qualidade do ar calculados para cada poluente e o Índice de Qualidade do Ar consolidado (IQAr) diário;
     - Sinalizações de validação técnica do registro (flags de qualidade) e identificação de dados ausentes ou inválidos por falha técnica.

Solicito que os dados sejam enviados por meio de arquivos digitais anexos ou disponibilização de link de download direto, conforme preconiza o art. 8º, § 3º, inciso II da Lei nº 12.527/2011, evitando o envio de arquivos digitalizados em formato de imagem ou documentos PDF que impeçam o tratamento computacional dos dados.

Agradeço a atenção e aguardo o retorno no prazo legal.`;

export function IneaHistoryPage() {
  const [stations, setStations] = useState<StationInfo[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [monthlyProfile, setMonthlyProfile] = useState<any[]>([]);
  const [controllerFreq, setControllerFreq] = useState<any[]>([]);
  const [dataGaps, setDataGaps] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [isLaiModalOpen, setIsLaiModalOpen] = useState(false);
  const [copiedLai, setCopiedLai] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setApiError(false);

        const [resSummary, resStations, resMonthly, resController, resGaps] = await Promise.all([
          fetch("/api/air/inea/summary").then(r => r.ok ? r.json() : null),
          fetch("/api/air/inea/stations").then(r => r.ok ? r.json() : null),
          fetch("/api/air/inea/analytics/monthly-profile").then(r => r.ok ? r.json() : null),
          fetch("/api/air/inea/analytics/controller-frequency").then(r => r.ok ? r.json() : null),
          fetch("/api/air/inea/analytics/data-gaps").then(r => r.ok ? r.json() : null)
        ]);

        if (resSummary) setSummary(resSummary);
        if (resStations) setStations(resStations);
        if (resMonthly) setMonthlyProfile(resMonthly);
        if (resController) setControllerFreq(resController);
        if (resGaps) setDataGaps(resGaps);

        if (!resSummary || !resStations) {
          setApiError(true);
        }
      } catch (err) {
        console.error("Error loading history page data:", err);
        setApiError(true);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const handleCopyLai = async () => {
    try {
      await navigator.clipboard.writeText(LAI_TEMPLATE);
      setCopiedLai(true);
      setTimeout(() => setCopiedLai(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Set fallbacks for core variables
  const displaySummary = summary || {
    totalStations: 4,
    totalMeasurements: 15696,
    timeRange: { minDate: "2022-01-02", maxDate: "2025-02-13" },
    latest_ingested_at: null
  };

  const displayStationsList = STATIC_STATIONS.map(staticSt => {
    const dbMatch = stations.find(s => s.name === staticSt.name);
    return {
      ...staticSt,
      id: dbMatch?.id || ""
    };
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-10 relative">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/qualidade-ar" className="hover:text-slate-800 transition-colors">Radar do Ar</Link>
        <span>/</span>
        <Link to="/qualidade-ar/inea" className="hover:text-slate-800 transition-colors">INEA</Link>
        <span>/</span>
        <span className="text-slate-800">História</span>
      </div>

      {/* 1. Hero Section */}
      <SurfaceCard className="portal-stage-hero portal-stage-hero-lab overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="lab" className="portal-stage-icon">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </IconShell>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
              O que os dados oficiais revelam — e escondem — sobre o ar de Volta Redonda?
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2">
              De 2022 a fevereiro de 2025, organizamos a base pública do INEA para mostrar onde há leitura, onde há alerta e onde há silêncio.
            </p>
          </div>
          <div className="portal-stage-stat shrink-0">
            <span>2022–2025</span>
            <small>Série Histórica</small>
          </div>
        </div>
      </SurfaceCard>

      {/* Frase de Impacto */}
      <div className="border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50/30 to-transparent p-4 rounded-r-xl">
        <blockquote className="text-sm md:text-base font-black text-emerald-800 tracking-wide italic">
          "O dado que aparece importa. O dado que some também."
        </blockquote>
      </div>

      {apiError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-2xl">
          ⚠️ <strong>Nota:</strong> Não foi possível carregar os dados atualizados das APIs analíticas. Exibindo estatísticas e dados estáticos conhecidos.
        </div>
      )}

      {/* 2. Bloco "Em 30 segundos" */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
          Resumo Rápido — Em 30 segundos
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SurfaceCard className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 transition-all hover:shadow-xs">
            <div className="h-2 w-2 rounded-full bg-brand-primary" />
            <strong className="text-xs font-black text-slate-800 block">4 estações oficiais em Volta Redonda</strong>
            <p className="text-[11px] text-slate-500 leading-normal">
              Três estações automáticas fixas monitoradas na base e uma unidade móvel operante.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 transition-all hover:shadow-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <strong className="text-xs font-black text-slate-800 block">Dados públicos de 2022 a fevereiro de 2025</strong>
            <p className="text-[11px] text-slate-500 leading-normal">
              Um total de {displaySummary.totalMeasurements.toLocaleString("pt-BR")} registros consolidados e normalizados.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 transition-all hover:shadow-xs">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <strong className="text-xs font-black text-slate-800 block">SO₂ e material particulado aparecem entre os principais controladores</strong>
            <p className="text-[11px] text-slate-500 leading-normal">
              Esses poluentes são os principais causadores de notas elevadas (atenção) no Índice geral.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 transition-all hover:shadow-xs">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <strong className="text-xs font-black text-slate-800 block">Há lacunas largas na série pública</strong>
            <p className="text-[11px] text-slate-500 leading-normal">
              Estatísticas apontam grandes intervalos sem leitura válida de transmissão nas estações.
            </p>
          </SurfaceCard>
        </div>
      </div>

      {/* 4. Bloco "Como ler sem cair em erro" */}
      <div className="space-y-4">
        <SurfaceCard className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 shrink-0">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">
              Como ler sem cair em erro
            </h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-semibold">
            Esses dados não mostram concentração bruta em µg/m³. Eles mostram índices e subíndices IQAr. Também não são leitura minuto a minuto. São a última base pública disponível.
          </p>
        </SurfaceCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataFreshnessNotice />
          <MethodologyNotice />
        </div>
      </div>

      {/* 3. Seção "Onde o ar foi medido" */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-800">Onde o ar foi medido</h2>
        <p className="text-xs text-slate-500 font-semibold max-w-2xl">
          Conheça as 4 estações oficiais que compõem o monitoramento oficial nos dados do INEA em Volta Redonda.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displayStationsList.map((station) => (
            <SurfaceCard key={station.name} className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:shadow-md">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <strong className="text-sm font-black text-slate-800 block">{station.name}</strong>
                  {station.lat && station.lng && (
                    <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                      {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  {station.description}
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-slate-50">
                {station.id ? (
                  <Link
                    to={`/qualidade-ar/inea/estacoes/${station.id}`}
                    className="text-brand-primary font-bold hover:underline text-xs flex items-center gap-1"
                  >
                    <span>Ver página da estação</span>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <span className="text-slate-400 font-bold text-xs cursor-not-allowed" title="Conexão temporariamente indisponível para ver detalhe">
                    Detalhes indisponíveis
                  </span>
                )}
              </div>
            </SurfaceCard>
          ))}
        </div>
      </div>

      {/* 4. Linha do tempo da base pública */}
      <IneaHistoricalTimeline lastIngestedAt={displaySummary.latest_ingested_at} />

      {/* 5. Como ler o Índice IQAr */}
      <AqiExplainer />

      {/* 6. Seção "Quando o alerta apareceu" */}
      <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-black text-slate-800">Quando o alerta apareceu</h2>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed max-w-3xl">
            Aqui não estamos dizendo que o ar foi ruim todos os dias. Estamos mostrando, entre os dias com registro disponível, quando a classificação apareceu como MODERADA ou pior.
          </p>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-bold">
            Carregando dados mensais...
          </div>
        ) : monthlyProfile.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-bold leading-relaxed">
            Não foi possível carregar esta análise agora. A metodologia e os links continuam disponíveis.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {monthlyProfile.map((m) => (
                <div key={m.month} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="font-extrabold text-slate-800">{m.month_name}</strong>
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/40 px-2 py-0.5 rounded font-black">
                      {m.degraded_percent_of_measured_days}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${m.degraded_percent_of_measured_days}%` }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold block">
                    {m.degraded_days} dias de atenção de {m.measured_days} medidos
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3.5 bg-amber-50/50 border border-amber-200/20 rounded-xl text-[11px] leading-relaxed text-amber-900 font-semibold">
              ⚠️ <strong>Ressalva Metodológica Importante:</strong> {monthlyProfile[0]?.caveat || "Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado não é qualidade boa."}
            </div>
          </div>
        )}
      </SurfaceCard>

      {/* 7. Seção "Quem puxou o índice" */}
      <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-black text-slate-800">Quem puxou o índice</h2>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            O poluente controlador é aquele que mais pesou no Índice IQAr em determinado registro.
          </p>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-bold">
            Carregando frequências...
          </div>
        ) : controllerFreq.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-bold leading-relaxed">
            Não foi possível carregar esta análise agora. A metodologia e os links continuam disponíveis.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {controllerFreq.map((item) => (
                <div key={item.pollutant} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="font-extrabold text-slate-700">{item.pollutant}</strong>
                    <span className="font-semibold text-slate-500">{item.count} registros ({item.percentage}%)</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-center space-y-3">
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">Por que isso importa?</h4>
              <p className="text-[11px] leading-relaxed text-slate-600 font-semibold">
                Saber qual poluente é o "controlador" ajuda a identificar a principal fonte de preocupação ambiental na área. Por exemplo, altas frequências de Dióxido de Enxofre (SO₂) ou Materiais Particulados (PM10/PM2.5) frequentemente se relacionam a processos de combustão industrial e poeiras suspensas urbanas.
              </p>
            </div>
          </div>
        )}
      </SurfaceCard>

      {/* 8. Seção "Onde a série fica em silêncio" */}
      <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-black text-slate-800">Onde a série fica em silêncio</h2>
          
          <div className="flex flex-col gap-2">
            <strong className="text-xl md:text-2xl font-black text-amber-700 block tracking-tight">
              "Ausência de dado não é ar bom."
            </strong>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Quando a estação fica sem registro público, a população perde o direito de acompanhar o que respirou naquele período.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-bold">
            Carregando lacunas...
          </div>
        ) : dataGaps.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-bold leading-relaxed">
            Não foi possível carregar esta análise agora. A metodologia e os links continuam disponíveis.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dataGaps.map((gap) => (
                <div key={gap.station_id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2 flex flex-col justify-between">
                  <div>
                    <strong className="text-xs font-extrabold text-slate-800 block">{gap.station_name}</strong>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Cobertura: {gap.coverage_percent}%</span>
                  </div>
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                      <span>Lacunas &gt; 24h:</span>
                      <strong className="text-slate-800">{gap.gap_count} ocorrências</strong>
                    </div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                      <span>Maior Lacuna:</span>
                      <strong className="text-amber-800">{gap.max_gap_hours} horas</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-slate-100 rounded-xl text-[11px] leading-relaxed text-slate-500 font-semibold italic text-center">
              "Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado não é qualidade boa."
            </div>
          </div>
        )}
      </SurfaceCard>

      {/* 9. Seção "O que dá para afirmar" */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-800">O que dá para afirmar</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SurfaceCard className="p-4 border border-slate-100 bg-white rounded-xl space-y-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mb-2" />
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              Há uma base pública oficial organizada de 2022 a fevereiro de 2025.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 border border-slate-100 bg-white rounded-xl space-y-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mb-2" />
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              Há registros classificados como MODERADA e RUIM.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 border border-slate-100 bg-white rounded-xl space-y-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mb-2" />
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              SO2 e material particulado aparecem como controladores relevantes nos dados disponíveis.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 border border-slate-100 bg-white rounded-xl space-y-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 mb-2" />
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              Há lacunas importantes que precisam ser explicadas.
            </p>
          </SurfaceCard>
        </div>
      </div>

      {/* 10. Seção "O que ainda precisamos cobrar" */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-800">O que ainda precisamos cobrar</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SurfaceCard className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demanda 1</span>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              Dados anteriores a 2022 em formato aberto.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demanda 2</span>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              Concentrações brutas horárias e diárias.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demanda 3</span>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              Histórico de manutenção e falhas das estações.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demanda 4</span>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              Metadados de instalação, calibração e operação.
            </p>
          </SurfaceCard>

          <SurfaceCard className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demanda 5</span>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              API pública documentada para consulta histórica.
            </p>
          </SurfaceCard>
        </div>
      </div>

      {/* CTA Final "Queremos a série completa" */}
      <SurfaceCard className="p-6 md:p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl space-y-6 relative overflow-hidden shadow-lg border-0">
        {/* Glowing graphic decorations */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-3 relative z-10">
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-indigo-100">
            Queremos a série completa
          </h2>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Se as estações já mediam antes de 2022, os dados anteriores também precisam estar disponíveis em formato aberto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
          <button
            onClick={() => setIsLaiModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl hover:bg-emerald-400 transition-colors text-xs shadow-md"
          >
            Ver minuta de LAI
          </button>
          <Link
            to="/qualidade-ar/inea/analises"
            className="px-5 py-2.5 bg-slate-800 text-indigo-100 border border-slate-700 font-bold rounded-xl hover:bg-slate-700 transition-colors text-xs"
          >
            Ver análises
          </Link>
          <Link
            to="/qualidade-ar/inea"
            className="px-5 py-2.5 bg-slate-800 text-indigo-100 border border-slate-700 font-bold rounded-xl hover:bg-slate-700 transition-colors text-xs"
          >
            Abrir mapa das estações
          </Link>
          <Link
            to="/dados"
            className="px-5 py-2.5 bg-slate-800 text-slate-300 border border-slate-700/60 font-bold rounded-xl hover:bg-slate-700 transition-colors text-xs"
          >
            Voltar para Dados
          </Link>
        </div>
      </SurfaceCard>

      {/* Modal Interativa da Minuta de LAI */}
      {isLaiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <strong className="text-slate-800 text-sm md:text-base font-black">
                  Minuta para Pedido de Informação (LAI)
                </strong>
              </div>
              <button
                onClick={() => setIsLaiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed shrink-0">
              Copie o modelo abaixo e protocolo-o no e-SIC do Estado do Rio de Janeiro direcionado ao <strong>INEA</strong> para solicitar a série de 2010 a 2021.
            </p>

            <div className="overflow-y-auto p-4 bg-slate-50 border border-slate-100 rounded-2xl flex-1 select-all font-mono text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed">
              {LAI_TEMPLATE}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t shrink-0">
              <button
                onClick={handleCopyLai}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${copiedLai ? "bg-emerald-600 text-white" : "bg-brand-primary text-white hover:bg-brand-primary-dark"}`}
              >
                {copiedLai ? (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copiar Minuta</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsLaiModalOpen(false)}
                className="px-4 py-2 border border-slate-200 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
