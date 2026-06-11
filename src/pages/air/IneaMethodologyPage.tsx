import { Suspense, lazy, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SurfaceCard, IconShell } from "../../components/BrandSystem";

const DataAvailabilityMatrix = lazy(() =>
  import("../../components/air/DataAvailabilityMatrix").then((module) => ({ default: module.DataAvailabilityMatrix }))
);

type DataDictionaryEntry = {
  field_name: string;
  label: string;
  description: string;
  unit: string;
  source: string;
  caveat: string;
};

function MethodologySectionFallback() {
  return (
    <SurfaceCard className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-44 rounded-full bg-slate-200/80" />
        <div className="h-20 rounded-2xl bg-slate-100/90" />
        <div className="h-20 rounded-2xl bg-slate-50" />
      </div>
    </SurfaceCard>
  );
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateStr;
  }
}

export function IneaMethodologyPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("origem");
  const [manifest, setManifest] = useState<any>(null);
  const [dataDictionary, setDataDictionary] = useState<DataDictionaryEntry[]>([]);

  useEffect(() => {
    fetch("/data/air/manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Manifest not found");
        return res.json();
      })
      .then((data) => setManifest(data))
      .catch((err) => console.error("Error loading manifest:", err));
  }, []);

  useEffect(() => {
    let cancelled = false;

    import("../../data/air/data-dictionary.ts")
      .then((module) => {
        if (!cancelled) {
          setDataDictionary(module.DATA_DICTIONARY);
        }
      })
      .catch((err) => console.error("Error loading data dictionary:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  // Handle smooth scroll when navigating to hash anchors
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(id);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const sections = [
    { id: "origem", label: "Origem dos Dados" },
    { id: "calculos", label: "O que Calculamos" },
    { id: "validade", label: "Regras de Validade" },
    { id: "reguas", label: "Réguas de Comparação" },
    { id: "camadas", label: "Camadas de Dados" },
    { id: "limitacoes", label: "Limitações" },
    { id: "exclusoes-governanca", label: "Bloqueios e Exclusões" },
    { id: "baixar-dados", label: "Baixar Dados (CSV)" },
    { id: "dicionario", label: "Dicionário de Dados" },
    { id: "disponibilidade", label: "Disponibilidade dos Dados" },
    { id: "expansao", label: "Decisões de Governança" },
    { id: "justica-ambiental", label: "Exposição Social e Justiça Ambiental" }
  ];

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back link */}
      <div className="mb-6">
        <Link 
          to="/qualidade-ar/inea" 
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-brand-primary transition-colors"
        >
          &larr; Voltar para Radar INEA
        </Link>
      </div>

      {/* Hero Header */}
      <header className="mb-10 text-center md:text-left space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary border border-brand-primary/25">
          Transparência e Reprodutibilidade
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
          Metodologia e Dados Abertos
        </h1>
        <p className="text-slate-600 text-sm md:text-base max-w-4xl font-medium leading-relaxed">
          Entenda de onde vêm os dados, como calculamos médias e episódios de atenção, quais são as limitações e como baixar os arquivos para auditoria cidadã.
        </p>
      </header>

      {/* Dynamic Data Updates Info Banner */}
      <div className="mb-8 p-4 bg-slate-50 border border-slate-200/65 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-600 shadow-sm animate-fade-in">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Última atualização dos dados:{" "}
              <strong className="text-slate-800">
                {manifest ? formatDate(manifest.generated_at) : "Carregando..."}
              </strong>
            </span>
          </div>
          <span className="hidden sm:inline text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>
              Último smoke test público:{" "}
              <strong className="text-slate-800">
                {manifest ? formatDate(manifest.last_smoke_test_at) : "Carregando..."}
              </strong>
            </span>
          </div>
        </div>
        {manifest?.dataset_version && (
          <div className="text-[10px] font-black uppercase tracking-wider bg-slate-200/50 px-2 py-0.5 rounded text-slate-500 self-start sm:self-center">
            Versão do Dataset: {manifest.dataset_version}
          </div>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 items-start">
        {/* Floating Table of Contents Sidebar */}
        <aside className="hidden lg:block sticky top-6 bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Sumário</h3>
          <nav className="flex flex-col gap-1" aria-label="Navegação interna da metodologia">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleScrollTo(sec.id)}
                className={`text-left px-3 py-2 text-xs font-black rounded-xl transition-all ${
                  activeSection === sec.id
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/10"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-200/60 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Operacional</h4>
            
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              O Observatório possui rotina de verificação automática. O status saudável indica que páginas, APIs e arquivos públicos responderam corretamente no último healthcheck.
            </p>

            <div className="space-y-2 text-xs font-medium text-slate-600 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Status atual:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {manifest?.status ? (manifest.status.charAt(0).toUpperCase() + manifest.status.slice(1)) : "Saudável"}
                </span>
              </div>
              <div className="flex justify-between items-center col-span-2">
                <span className="text-slate-400 font-bold text-[10px]">Último healthcheck:</span>
                <span className="font-bold text-slate-800 text-[9px] truncate max-w-[120px]" title={manifest ? formatDate(manifest.last_smoke_test_at || manifest.generated_at) : ""}>
                  {manifest ? formatDate(manifest.last_smoke_test_at || manifest.generated_at) : "Carregando..."}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Versão do dataset:</span>
                <span className="font-bold text-slate-800">
                  {manifest?.version || manifest?.dataset_version || "1.6.0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Datasets públicos:</span>
                <span className="font-bold text-slate-800">
                  {manifest?.datasets ? manifest.datasets.length : 21}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href="/data/air/manifest.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-1.5 px-2 bg-slate-100 hover:bg-slate-200/70 rounded-xl text-[9px] font-black uppercase text-slate-600 tracking-wider transition-colors"
                >
                  Ver manifest.json
                </a>
                <a
                  href="#baixar-dados"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo("baixar-dados");
                  }}
                  className="block text-center py-1.5 px-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors"
                >
                  Baixar dados
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <div className="space-y-12">
          {/* Section 1: De onde vêm os dados */}
          <section id="origem" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="brand" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 12V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">De onde vêm os dados</h2>
            </div>
            
            <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                As séries históricas disponibilizadas no Observatório do Ar são originadas a partir dos <strong>dados horários públicos exibidos pela plataforma INEA/WebLakes</strong> (sistema público governamental do Instituto Estadual do Ambiente do Rio de Janeiro).
              </p>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Essas leituras físicas horárias brutas são transmitidas pelas estações automáticas oficiais instaladas em Volta Redonda (Belmonte, Retiro e Santa Cecília). É crucial destacar que a base WebLakes original <strong>não disponibiliza uma flag técnica oficial de validação de qualidade (QA/QC) explícita por registro horário</strong>. Dessa forma, as análises de excedência são tratadas estritamente sob o escopo de <strong>comparação experimental</strong>.
              </p>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                <strong>Diferença de Sistemas:</strong> Enquanto a plataforma WebLakes disponibiliza dados horários de concentração (µg/m³), as planilhas oficiais consolidadas de qualidade do ar do INEA (Dados Abertos RJ) apresentam médias de índices adimensionalizados (IQAr) em escala diária. O Observatório do Ar reconcilia essas bases para oferecer uma leitura pública integrada de qualidade do ar e prioridade territorial.
              </p>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <strong className="block text-xs font-black uppercase tracking-wider text-emerald-800">Fonte oficial atual e trilhas históricas</strong>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-emerald-900/80">
                  O portal de Dados Abertos RJ identifica o arquivo <code>qualidade_ar.xlsx</code> como recurso público do conjunto "Segurança hídrica, qualidade ambiental do ar, água e solo", com extração semestral da plataforma Ambiente+. Estudos acadêmicos e relatórios técnicos também citam séries antigas do INEA, especialmente entre 2007 e 2015. Essas referências orientam a pesquisa histórica, mas não entram automaticamente nos painéis: primeiro precisam de fonte recuperável, unidade conferida, cobertura mínima e relatório de auditoria.
                </p>
              </div>
            </SurfaceCard>
          </section>

          {/* Section 2: O que calculamos */}
          <section id="calculos" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="lab" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">O que calculamos</h2>
            </div>
            
            <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                A partir dos microdados coletados em lote, computamos os seguintes indicadores de reprodutibilidade:
              </p>
              <ul className="grid gap-3 text-sm text-slate-600 font-medium md:grid-cols-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black">&bull;</span>
                  <span><strong>Médias Horárias:</strong> Concentração de material particulado registrada a cada hora cheia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black">&bull;</span>
                  <span><strong>Médias Diárias (24h):</strong> Média aritmética simples das leituras físicas de um mesmo dia civil.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black">&bull;</span>
                  <span><strong>Médias Anuais:</strong> Média aritmética simples de todas as leituras horárias válidas de um ano civil completo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black">&bull;</span>
                  <span><strong>Picos Horários Pontuais de Concentração:</strong> A maior leitura individual absoluta registrada no ano/mês.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black">&bull;</span>
                  <span><strong>Excedências da OMS:</strong> Dias com médias diárias acima do limiar de saúde recomendado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black">&bull;</span>
                  <span><strong>Excedências da CONAMA 506:</strong> Dias acima da meta nacional legal brasileira.</span>
                </li>
              </ul>
            </SurfaceCard>
          </section>

          {/* Section 3: Regras de validade */}
          <section id="validade" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="brand" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Regras de validade técnica</h2>
            </div>
            
            <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Para garantir a honestidade científica e afastar distorções estatísticas, aplicamos três filtros de integridade fundamentais:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <strong className="text-xs text-slate-700 uppercase tracking-wider block mb-1">Média Diária (Regra das 18h)</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Um dia civil só é validado para cálculo da média diária se contiver, no mínimo, 18 leituras horárias físicas válidas (75% de representatividade). Dias com menos de 18 horas de dados são integralmente descartados do cômputo de excedências.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <strong className="text-xs text-slate-700 uppercase tracking-wider block mb-1">Filtro de Cobertura e Zeros (ZERO_VALUE_REVIEW)</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Leituras com valor de concentração exatamente igual a zero são preservadas no banco para manter a integridade da extração, mas recebem uma marcação interna de auditoria técnico-calibratória para diferenciar baixos níveis reais de eventuais falhas instrumentais.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <strong className="text-xs text-slate-700 uppercase tracking-wider block mb-1">Transparência sobre lacunas</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Afirmamos categoricamente: <strong>ausência de dado não representa ar bom</strong>. Avarias em sensores ou falhas na transmissão pública geram lacunas de informação e nunca devem ser computadas ou interpretadas como indicação de ar livre de poluição.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <strong className="text-xs text-slate-700 uppercase tracking-wider block mb-1">Anos parciais/em andamento</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Para anos civis ainda em andamento (como 2026), os indicadores acumulados representam apenas o recorte temporal disponível (de janeiro a maio). Para evitar distorções metodológicas, esses dados são identificados com um selo explicativo ("*") e não devem ser diretamente comparados a séries históricas anuais completas fechadas.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <strong className="text-xs text-slate-700 uppercase tracking-wider block mb-1">Cobertura Insuficiente em Séries Antigas</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Para séries históricas antigas (especialmente entre 2013 e 2019), alguns poluentes e estações apresentam taxa de cobertura anual inferior a 75%. Nesses casos, a média anual calculada deve ser lida estritamente como a média do período disponível com dados e não como uma representação da comparação anual plena ou conformidade definitiva. Esse status é sinalizado nas interfaces e no manifesto com a tag <code>INSUFFICIENT_ANNUAL_COVERAGE</code>.
                  </p>
                </div>
              </div>
            </SurfaceCard>
          </section>

          {/* Section 4: Réguas de comparação */}
          <section id="reguas" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="lab" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Réguas de comparação</h2>
            </div>
            
            <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                As concentrações diárias compiladas são cruzadas com duas métricas de relevância metodológica distinta:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-emerald-500/10 bg-emerald-50/20 rounded-2xl space-y-1">
                  <strong className="text-sm font-bold text-slate-800 block">Régua de Saúde (Diretriz OMS 2021)</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Valores máximos recomendados pela Organização Mundial da Saúde para proteção do sistema respiratório em exposições diárias de 24 horas:
                  </p>
                  <ul className="text-xs text-slate-600 font-bold mt-2 space-y-0.5">
                    <li>PM10: 45 µg/m³</li>
                    <li>PM2.5: 15 µg/m³</li>
                    <li>SO₂: 40 µg/m³</li>
                    <li>CO: 4 mg/m³</li>
                  </ul>
                </div>
                <div className="p-4 border border-brand-primary/10 bg-brand-primary/5 rounded-2xl space-y-1">
                  <strong className="text-sm font-bold text-slate-800 block">Régua Legal Nacional (CONAMA 506)</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Limites diários estabelecidos pela Resolução CONAMA 506/2018 como padrões regulamentares nacionais de qualidade do ar (vigentes no Brasil):
                  </p>
                  <ul className="text-xs text-slate-600 font-bold mt-2 space-y-0.5">
                    <li>PM10: 50 µg/m³</li>
                    <li>PM2.5: 25 µg/m³</li>
                    <li>SO₂: 20 µg/m³</li>
                    <li>CO: 9 ppm (média móvel de 8 horas)</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-slate-400 italic mt-2">
                Nota: Todas as checagens com essas réguas são executadas como uma comparação experimental, já que o espelho original não conta com QA/QC oficial por linha.
              </p>
            </SurfaceCard>
          </section>

          {/* Section 5: Camadas de dados */}
          <section id="camadas" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="brand" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Camadas de dados do portal</h2>
            </div>
            
            <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                O Observatório do Ar organiza a informação de qualidade do ar em Volta Redonda em três camadas distintas para facilitar o acesso de diferentes públicos:
              </p>
              <div className="space-y-3.5 text-sm text-slate-600 font-medium leading-relaxed">
                <div>
                  <strong className="text-slate-800 font-bold">1. Dado Horário Público WebLakes:</strong>
                  <p className="text-xs text-slate-500">Leituras horárias de concentração. Nível mais granular, ideal para análise de picos horários pontuais de concentração.</p>
                </div>
                <div>
                  <strong className="text-slate-800 font-bold">2. Índices IQAr (Dados Abertos RJ):</strong>
                  <p className="text-xs text-slate-500">Médias consolidadas oficiais em planilhas do INEA. Ótimo para verificar classificações de qualidade diárias declaradas.</p>
                </div>
                <div>
                  <strong className="text-slate-800 font-bold">3. Evidências Históricas Agregadas:</strong>
                  <p className="text-xs text-slate-500">Consolidados plurianuais, matrizes de sazonalidade e relatórios analíticos ("Estado da Nação") produzidos pelo SEMEAR.</p>
                </div>
              </div>
            </SurfaceCard>
          </section>

          {/* Section 6: Limitações */}
          <section id="limitacoes" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="lab" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Limitações do repositório</h2>
            </div>
            
            <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Transparência ativa exige apontar os limites do nosso próprio escopo. Os usuários devem estar atentos aos seguintes fatores:
              </p>
              <ul className="space-y-3 text-xs text-slate-500 font-semibold leading-relaxed list-disc pl-4">
                <li><strong>Dependência Técnica:</strong> O Observatório compila dados fornecidos por canais públicos. Avarias em sensores ou ausência de leituras no site original geram lacunas de dados que fogem ao nosso controle.</li>
                <li><strong>Sem QA/QC explícito por registro:</strong> Os dados horários brutos são capturados como exibidos, sem tratamento regulatório por linha. Podem ocorrer leituras anômalas não auditadas.</li>
                <li><strong>Acesso Pleno a Séries Completas:</strong> O resgate de microdados brutos históricos completos depende de requisições externas e minutas da Lei de Acesso à Informação (LAI) para períodos de silêncio do sinal público.</li>
                <li><strong>Fontes históricas externas:</strong> Artigos científicos, relatórios anuais do INEA e bases de terceiros podem indicar existência de dados anteriores ou consolidados, mas só são usados como validação cruzada e roteiro de busca. O Radar não incorpora números de literatura como se fossem microdados horários oficiais sem reprocessamento auditável.</li>
                <li><strong>Início do Monitoramento de PM2.5 (2021):</strong> A série histórica do material particulado fino (PM2.5) em Volta Redonda inicia-se em 2021. No ano de 2020, o monitoramento público do INEA limitou-se ao PM10 (particulado inalável). Como não há dados públicos disponíveis na plataforma INEA/WebLakes antes de 2021 no recorte validado, a ausência de PM2.5 em 2020 não deve ser interpretada como conformidade de níveis de poluição.</li>
                <li><strong>Mapeamento Experimental:</strong> Todos os cruzamentos de excedências servem como indicação didática de eventos de atenção, não devendo ser utilizados para fundamentar penalidades ou litígios de forma direta.</li>
              </ul>
            </SurfaceCard>
          </section>

          {/* Section 6.5: Por que alguns parâmetros não são publicados mesmo quando existem dados? */}
          <section id="exclusoes-governanca" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="warm" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Por que alguns parâmetros não são publicados?</h2>
            </div>

            <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                O fato de uma leitura de poluição constar na plataforma pública original não significa que ela esteja qualificada para publicação. Sensores físicos podem apresentar descalibrações ou anomalias eletrônicas severas. O Observatório prefere bloquear a expor dados duvidosos.
              </p>
              <div className="space-y-3.5 text-xs text-slate-500 font-semibold leading-relaxed">
                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <strong>1. Erros de Offset (Deslocamento de Zero):</strong>
                  <p className="mt-1 font-medium text-slate-500">
                    Ocorrem quando o sensor registra um valor mínimo basal deslocado para cima. Em 2024, a estação Retiro para NO₂ registrou um offset sistemático de aproximadamente +20 µg/m³, distorcendo a leitura anual de concentração nesse parâmetro.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <strong>2. Erros de Ganho (Multiplicadores Anômalos):</strong>
                  <p className="mt-1 font-medium text-slate-500">
                    Ocorrem quando o sinal elétrico é multiplicado eletronicamente por um multiplicador de escala incorreto. No PTS de Retiro em 2024, constatou-se um erro de escala de exatamente 10x (multiplicador artificial), inflando todas as leituras.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <strong>3. Rigor Editorial e Cautela Cidadã:</strong>
                  <p className="mt-1 font-medium text-slate-500">
                    Expor dados calibrados incorretamente pode induzir o pânico público ou ocultar a realidade ambiental. O Observatório mantém parâmetros sob quarentena ou bloqueio preventivo enquanto durarem as anomalias técnicas detectadas.
                  </p>
                </div>
              </div>
            </SurfaceCard>
          </section>

          {/* Section 7: Baixar dados */}
          <section id="baixar-dados" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="brand" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Baixar dados consolidados (CSV)</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-3">
              <SurfaceCard className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400">Linha do Tempo de PM10 (2013-2026)</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Série histórica plurianual consolidando médias, coberturas e excedências diárias de PM10.</p>
                </div>
                <a
                  href="/data/air/pm10-timeline-2013-2026.csv"
                  download="pm10-timeline-2013-2026.csv"
                  className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-brand-primary text-white font-black text-xs uppercase hover:bg-brand-primary-dark transition-all w-full tracking-wider shadow-sm"
                >
                  Download (CSV)
                </a>
              </SurfaceCard>

              <SurfaceCard className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400">Linha do Tempo de SO2 (2013-2026)</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Série histórica plurianual consolidando médias, coberturas e excedências diárias de SO₂.</p>
                </div>
                <a
                  href="/data/air/so2-timeline-2013-2026.csv"
                  download="so2-timeline-2013-2026.csv"
                  className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-brand-primary text-white font-black text-xs uppercase hover:bg-brand-primary-dark transition-all w-full tracking-wider shadow-sm"
                >
                  Download (CSV)
                </a>
              </SurfaceCard>

              <SurfaceCard className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400">Linha do Tempo de CO (2013-2026)</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">Série histórica plurianual consolidando médias, coberturas e excedências diárias de CO.</p>
                </div>
                <a
                  href="/data/air/co-timeline-2013-2026.csv"
                  download="co-timeline-2013-2026.csv"
                  className="inline-flex min-h-[38px] items-center justify-center rounded-xl bg-brand-primary text-white font-black text-xs uppercase hover:bg-brand-primary-dark transition-all w-full tracking-wider shadow-sm"
                >
                  Download (CSV)
                </a>
              </SurfaceCard>
            </div>

            {/* Tabela de Arquivos disponíveis */}
            <div className="space-y-3 mt-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Arquivos disponíveis</h3>
              <SurfaceCard className="p-0 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-5 py-4">Arquivo</th>
                        <th className="px-5 py-4">O que contém</th>
                        <th className="px-3 py-4 text-center">Formato</th>
                        <th className="px-5 py-4">Atualização</th>
                        <th className="px-5 py-4 text-right">Baixar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                      {[
                        {
                          file: "pm10-timeline-2013-2026.csv",
                          desc: "Série histórica estendida e consolidada de PM10 de 2013 a 2026.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm10-timeline-2013-2026.csv"
                        },
                        {
                          file: "so2-timeline-2013-2026.csv",
                          desc: "Série histórica estendida e consolidada de SO₂ de 2013 a 2026.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/so2-timeline-2013-2026.csv"
                        },
                        {
                          file: "co-timeline-2013-2026.csv",
                          desc: "Série histórica estendida e consolidada de CO de 2013 a 2026.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/co-timeline-2013-2026.csv"
                        },
                        {
                          file: "pm10-2020-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o PM10 em 2020.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm10-2020-station-summary.csv"
                        },
                        {
                          file: "pm10-2021-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o PM10 em 2021.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm10-2021-station-summary.csv"
                        },
                        {
                          file: "pm25-2021-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2021.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm25-2021-station-summary.csv"
                        },
                        {
                          file: "pm25-2022-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2022.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm25-2022-station-summary.csv"
                        },
                        {
                          file: "pm25-2023-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2023.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm25-2023-station-summary.csv"
                        },
                        {
                          file: "pm10-2024-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o PM10 em 2024.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm10-2024-station-summary.csv"
                        },
                        {
                          file: "pm25-2024-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2024.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm25-2024-station-summary.csv"
                        },
                        {
                          file: "so2-2024-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o SO2 experimental em 2024.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/so2-2024-station-summary.csv"
                        },
                        {
                          file: "co-2024-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o CO experimental em 2024.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/co-2024-station-summary.csv"
                        },
                        {
                          file: "pm10-2025-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o PM10 em 2025.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm10-2025-station-summary.csv"
                        },
                        {
                          file: "pm25-2025-station-summary.csv",
                          desc: "Estatísticas anuais consolidadas por estação para o PM2.5 em 2025.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm25-2025-station-summary.csv"
                        },
                        {
                          file: "pm10-2026-partial-station-summary.csv",
                          desc: "Estatísticas parciais acumuladas (Jan a Mai) por estação para o PM10 em 2026.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm10-2026-partial-station-summary.csv"
                        },
                        {
                          file: "pm25-2026-partial-station-summary.csv",
                          desc: "Estatísticas parciais acumuladas (Jan a Mai) por estação para o PM2.5 em 2026.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/pm25-2026-partial-station-summary.csv"
                        },
                        {
                          file: "particulate-timeline-2020-2026.csv",
                          desc: "Linha do tempo plurianual de médias, coberturas e excedências anuais de particulados (2020-2026).",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/particulate-timeline-2020-2026.csv"
                        },
                        {
                          file: "so2-timeline-2020-2026.csv",
                          desc: "Linha do tempo plurianual de médias, coberturas e excedências anuais para o SO2 (2020-2026).",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/so2-timeline-2020-2026.csv"
                        },
                        {
                          file: "co-timeline-2020-2026.csv",
                          desc: "Linha do tempo plurianual de médias, coberturas e excedências anuais para o CO (2020-2026).",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/co-timeline-2020-2026.csv"
                        },
                        {
                          file: "attention-episodes-2020-2026.csv",
                          desc: "Série mensal de excedências OMS/CONAMA e picos horários de concentração (2020–2026).",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/attention-episodes-2020-2026.csv"
                        },
                        {
                          file: "data-dictionary.csv",
                          desc: "Metadados descrevendo os campos das planilhas exportadas.",
                          format: "CSV",
                          updated: "Maio de 2026",
                          path: "/data/air/data-dictionary.csv"
                        }
                      ].map((row) => (
                        <tr key={row.file} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono text-brand-primary font-bold">
                            {row.file}
                          </td>
                          <td className="px-5 py-4 leading-relaxed text-slate-500">
                            {row.desc}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] text-slate-500">
                                {row.format}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {row.updated}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <a
                              href={row.path}
                              download={row.file}
                              className="inline-flex min-h-[32px] items-center justify-center rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors"
                            >
                              Baixar
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SurfaceCard>
            </div>
          </section>

          {/* Section 8: Dicionário de dados */}
          <section id="dicionario" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="lab" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Dicionário de dados interativo</h2>
            </div>
            
            <SurfaceCard className="p-0 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-4">Campo</th>
                      <th className="px-5 py-4">Rótulo</th>
                      <th className="px-5 py-4">Descrição</th>
                      <th className="px-3 py-4 text-center">Unidade</th>
                      <th className="px-5 py-4">Origem</th>
                      <th className="px-5 py-4">Ressalva Técnica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                    {dataDictionary.map((entry) => (
                      <tr key={entry.field_name} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono text-brand-primary font-bold">
                          {entry.field_name}
                        </td>
                        <td className="px-5 py-4 text-slate-800 font-bold">
                          {entry.label}
                        </td>
                        <td className="px-5 py-4 leading-relaxed">
                          {entry.description}
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] text-slate-500">
                            {entry.unit}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {entry.source}
                        </td>
                        <td className="px-5 py-4 italic text-slate-400 text-[11px] leading-relaxed">
                          {entry.caveat}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {dataDictionary.length === 0 && (
                <div className="border-t border-slate-100 p-5">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs font-bold text-slate-500">
                    Carregando dicionário de dados...
                  </div>
                </div>
              )}
            </SurfaceCard>
          </section>

          {/* Section 9: Disponibilidade dos dados */}
          <section id="disponibilidade" className="space-y-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="lab" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Disponibilidade dos dados por estação</h2>
            </div>
            
            <Suspense fallback={<MethodologySectionFallback />}>
              <DataAvailabilityMatrix />
            </Suspense>
          </section>

          {/* Section 10: Parâmetros em Expansão (Homologação) */}
          <section id="expansao" className="space-y-4 scroll-mt-6 border-t border-slate-200/60 pt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="warm" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Parâmetros em decisão de governança</h2>
            </div>

            <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-6">
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                O Observatório do Ar expandiu o monitoramento para incluir parâmetros gasosos atmosféricos. SO₂ e CO possuem série histórica publicada de 2013 a 2026. NO₂ permanece bloqueado por salvaguarda editorial. PTS e O₃ aparecem na memória histórica 2013-2015, mas seguem separados dos painéis consolidados: PTS como memória técnica e O₃ como métrica em auditoria.
              </p>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">SO₂ e CO — Série Histórica 2013–2026 ✅</h3>

                <div className="p-4 bg-emerald-50/40 border border-emerald-500/10 rounded-2xl space-y-2">
                  <strong className="text-xs text-emerald-800 uppercase tracking-wider block">SO₂ (Dióxido de Enxofre) — Publicável com Cautela</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    SO₂ está disponível em série histórica para 2013–2026 (2026 parcial) nas estações Belmonte, Retiro e Santa Cecília. A série não apresenta anomalias instrumentais sistemáticas.
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 font-semibold space-y-1.5 pl-2">
                    <li><strong>Médias Diárias:</strong> Calculadas com mínimo de <strong>18 horas válidas</strong> por dia.</li>
                    <li><strong>Régua OMS:</strong> 40 µg/m³ (média diária). Excedências registradas apenas em Santa Cecília 2020 (3 dias).</li>
                    <li><strong>Régua CONAMA 506:</strong> 20 µg/m³ (média diária). Excedências em 2020 e 2021; tendência decrescente até 2024–2026.</li>
                    <li><strong>Atenção:</strong> Santa Cecília 2025 apresenta cobertura insuficiente (45%) — dado sinalizado nos arquivos CSV.</li>
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50/40 border border-emerald-500/10 rounded-2xl space-y-2">
                  <strong className="text-xs text-emerald-800 uppercase tracking-wider block">CO (Monóxido de Carbono) — Publicável com Cautela</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    CO está disponível em série histórica para 2013–2026 (2026 parcial) nas três estações, com cobertura suficiente em todas as combinações ano × estação.
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 font-semibold space-y-1.5 pl-2">
                    <li><strong>Unidade Nativa:</strong> O CO é monitorado e exibido em <strong>ppm</strong> (partes por milhão) — unidade nativa da plataforma INEA/WebLakes.</li>
                    <li><strong>Conversão para OMS:</strong> A conversão de ppm para <strong>mg/m³</strong> usa o fator <strong>1,145</strong> (25°C, 1 atm) e é aplicada exclusivamente para comparação com o limite diário da OMS (4 mg/m³).</li>
                    <li><strong>Régua CONAMA 506:</strong> 9 ppm em média móvel de 8h (mínimo 6 horas válidas por janela). <strong>Zero excedências em toda a série 2013–2026.</strong></li>
                    <li><strong>Régua OMS:</strong> Zero excedências em toda a série 2013–2026.</li>
                  </ul>
                </div>

                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Parâmetros em quarentena ou bloqueio editorial 🚫</h3>

                <div className="p-4 bg-amber-50/40 border border-amber-500/10 rounded-2xl space-y-2">
                  <strong className="text-xs text-amber-800 uppercase tracking-wider block">NO₂ (Dióxido de Nitrogênio) — Em Auditoria Crítica (Bloqueado)</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    NO₂ permanece bloqueado na interface de dados abertos. Em 2024, a estação Retiro registrou um deslocamento constante de <strong>+20 µg/m³</strong> (offset de zero instrumental), enquanto Belmonte e Santa Cecília permaneceram normais (~15 µg/m³). A anomalia foi confirmada como exclusiva de 2024. A governança identificou que os demais anos (2020-2023, 2025-2026) são saudáveis, mas o parâmetro NO₂ permanece bloqueado por decisão de salvaguarda editorial.
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 font-semibold space-y-1 pl-2">
                    <li><strong>Régua OMS:</strong> 25 µg/m³ (média diária com ≥ 18h válidas).</li>
                    <li><strong>Régua CONAMA 506:</strong> 200 µg/m³ (pico horário).</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                  <strong className="text-xs text-slate-800 uppercase tracking-wider block">PTS (Partículas Totais em Suspensão) — Memória Técnica em Quarentena</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    PTS aparece de forma consistente na memória histórica 2013-2015 e pode sustentar leitura técnica sobre poeira total. Ainda assim, permanece fora dos painéis consolidados porque <strong>não é equivalente</strong> ao PM10 ou PM2.5 e porque, em 2024, a estação Retiro apresentou erro de ganho instrumental de <strong>fator 10x</strong> confirmado. A publicação deve separar claramente memória histórica, auditoria técnica e alertas operacionais.
                  </p>
                </div>

                <div className="p-4 bg-rose-50/60 border border-rose-100 rounded-2xl space-y-2">
                  <strong className="text-xs text-rose-900 uppercase tracking-wider block">O₃ (Ozônio) — Recuperado no triênio, mas em auditoria</strong>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    O diagnóstico histórico recuperou leituras de O₃ para 2013-2015, com cobertura suficiente para análise preliminar. Porém, a média do preview ainda diverge da literatura usada como validação cruzada; a diferença não parece ser explicada apenas pela regra de 18 horas válidas. Por isso, O₃ deve permanecer fora da publicação consolidada até confirmar a janela estatística correta, sem ser tratado como indisponível em todo o histórico.
                  </p>
                </div>
              </div>
            </SurfaceCard>
          </section>

          {/* Section 11: Exposição social e justiça ambiental */}
          <section id="justica-ambiental" className="space-y-4 scroll-mt-6 border-t border-slate-200/60 pt-6">
            <div className="flex items-center gap-3">
              <IconShell tone="warm" className="shrink-0 h-9 w-9">
                <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </IconShell>
              <h2 className="text-xl font-black text-slate-800">Exposição social e justiça ambiental</h2>
            </div>

            <SurfaceCard className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
              <div className="p-4 bg-rose-500/5 border border-rose-500/20 text-rose-950 rounded-2xl text-xs font-bold leading-relaxed">
                ⚠️ <strong>Nota de Salvaguarda Metodológica Obrigatória:</strong><br />
                O índice não mede risco individual, não estima dose pessoal e não prova causalidade. Ele organiza dados territoriais para indicar áreas onde sensibilidade social e sinais ambientais podem se sobrepor, apoiando priorização pública.
              </div>

              <div className="space-y-3.5 text-sm text-slate-600 font-medium leading-relaxed">
                <p>
                  A justiça ambiental parte do princípio de que nenhuma comunidade deve ficar sistematicamente mais exposta a pressões ambientais por sua condição socioeconômica, territorial ou demográfica. Em Volta Redonda, a sobreposição entre bairros residenciais populosos, equipamentos sociais e proximidade do complexo metalúrgico da Usina Presidente Vargas (CSN) exige leitura pública cuidadosa, sem transformar o índice em laudo causal.
                </p>
                <p>
                  <strong>Metodologia do Índice de Exposição Social (v0):</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-xs">
                  <li><strong>Sensibilidade Social (Peso 0.6):</strong> Focado em demografia mais sensível a contextos de poluição persistente. Reúne a taxa de crianças de 0 a 5 anos e idosos de 60 anos ou mais, sem inferir diagnóstico individual.</li>
                  <li><strong>Proxy Socioeconômica (Peso 0.4):</strong> Baseado na proporção de domicílios particulares permanentes com rendimento per capita de até meio salário mínimo (Censo IBGE 2022). Esse proxy indica menor margem material de adaptação e resposta, sem representar vulnerabilidade clínica individual.</li>
                  <li><strong>Pressão Atmosférica Territorial:</strong> Fatores geográficos que integram distância linear até áreas industriais e comportamento dos ventos locais descritos na camada meteorológica v1.6.1 (corredor Noroeste-Sudeste), como aproximação territorial de prioridade pública.</li>
                </ul>
                <p>
                  Este índice serve como ferramenta de planejamento para priorizar arborização urbana, barreiras vegetadas, atenção territorial da saúde pública e direcionamento de investimentos municipais. Ele não substitui investigação epidemiológica, fiscalização ambiental ou perícia técnica.
                </p>
              </div>
            </SurfaceCard>
          </section>

          {/* Mobile Status Operacional (visible only on mobile viewports) */}
          <div className="block lg:hidden mt-8 p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Status Operacional</h4>
            
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              O Observatório possui rotina de verificação automática. O status saudável indica que páginas, APIs e arquivos públicos responderam corretamente no último healthcheck.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
              <div className="p-3 bg-white rounded-2xl border border-slate-100/50 flex flex-col justify-between">
                <span className="text-[10px] uppercase text-slate-400 tracking-wider">Status Atual</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {manifest?.status ? (manifest.status.charAt(0).toUpperCase() + manifest.status.slice(1)) : "Saudável"}
                </span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-100/50 flex flex-col justify-between">
                <span className="text-[10px] uppercase text-slate-400 tracking-wider">Versão Dataset</span>
                <span className="font-bold text-slate-800 mt-1">
                  {manifest?.version || manifest?.dataset_version || "1.6.0"}
                </span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-100/50 flex flex-col justify-between col-span-2">
                <span className="text-[10px] uppercase text-slate-400 tracking-wider">Último Healthcheck</span>
                <span className="font-bold text-slate-800 mt-1 text-[10px]">
                  {manifest ? formatDate(manifest.last_smoke_test_at || manifest.generated_at) : "Carregando..."}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href="/data/air/manifest.json"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-2.5 px-4 bg-slate-200/50 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 tracking-wider transition-colors"
              >
                Ver manifest.json
              </a>
              <a
                href="#baixar-dados"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo("baixar-dados");
                }}
                className="block text-center py-2.5 px-4 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
              >
                Baixar dados
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IneaMethodologyPage;
