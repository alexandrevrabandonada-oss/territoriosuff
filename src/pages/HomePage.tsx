import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/home.css";
import type {
  AcervoItem,
  Event,
  ReportDocument,
  StationOverview
} from "../lib/api";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";

const REPORT_KIND_LABEL: Record<ReportDocument["kind"], string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota Técnica",
  boletim: "Boletim",
  anexo: "Anexo"
};

const navCards = [
  { to: "/dados", label: "Dados", copy: "Indicadores, séries históricas e leitura pública contextualizada.", tone: "blue", icon: "chart" },
  { to: "/acervo", label: "Acervo", copy: "Documentos, publicações e materiais técnicos.", tone: "green", icon: "archive" },
  { to: "/relatorios", label: "Relatórios", copy: "Relatórios, notas técnicas, boletins e anexos oficiais.", tone: "blue", icon: "file" },
  { to: "/agenda", label: "Agenda", copy: "Eventos, reuniões e atividades do projeto.", tone: "green", icon: "calendar" },
  { to: "/conversar", label: "Conversas e atividades", copy: "Registros de campo, escuta pública e ações no território.", tone: "blue", icon: "chat" }
];

function Icon({ name }: { name: string }) {
  const common = "h-5 w-5";
  if (name === "chart") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19V9m7 10V5m7 14v-7M4 21h16" />
      </svg>
    );
  }
  if (name === "archive") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h8l4 4v14H7V3Zm8 0v5h4M10 13h6M10 17h4" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v4m10-4v4M5 9h14M6 5h12a1 1 0 0 1 1 1v14H5V6a1 1 0 0 1 1-1Zm3 8h3m3 0h2m-8 4h3m3 0h2" />
      </svg>
    );
  }
  if (name === "chat") {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5m6 5-4-4H7a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v4a4 4 0 01-4 4h-1l3 4z" />
      </svg>
    );
  }
  return (
    <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4h8l3 3v13H5V4h3Zm8 0v4h3M8 13h8M8 17h6" />
    </svg>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function latestValue(stations: StationOverview[], key: "pm25" | "temp" | "humidity") {
  const station = stations.find((item) => item[key] !== null && item[key] !== undefined);
  return station?.[key] ?? null;
}

export function HomePage() {
  const [stations, setStations] = useState<StationOverview[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [, setAcervo] = useState<AcervoItem[]>([]);
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [monitoringApi, contentApi] = await Promise.all([
          import("../lib/api/monitoring"),
          import("../lib/api/content")
        ]);
        const [stationsData, eventsData, acervoData, reportsData] = await Promise.all([
          monitoringApi.getStationOverview(),
          contentApi.listUpcomingEvents(),
          contentApi.listAcervoItems({ featured: true, limit: 6 }),
          contentApi.listLatestReports(3)
        ]);
        setStations(stationsData);
        setEvents(eventsData.slice(0, 3));
        setAcervo(acervoData);
        setReports(reportsData.slice(0, 3));
      } catch (err) {
        console.error("Erro ao carregar dados da home:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const airQuality = latestValue(stations, "pm25");
  const temperature = latestValue(stations, "temp");
  const humidity = latestValue(stations, "humidity");

  const news = reports.map((report) => ({
    key: report.id,
    to: `/relatorios/${report.slug}`,
    type: REPORT_KIND_LABEL[report.kind],
    date: formatDate(report.published_at) || String(report.year ?? ""),
    title: report.title
  }))
    .slice(0, 3);

  return (
    <PortalPageShell className="home-shell" aria-labelledby="home-title">
      <PortalHero
        badge={
          <>
            <span className="badge-dados-abertos">Monitoramento do ar - UFF</span>
            <span className="badge-metodologia">Projeto UFF</span>
          </>
        }
        title={<span id="home-title" aria-label="Projeto UFF SEMEAR"><span>SEME</span><span>AR</span></span>}
        subtitle="Conhecimento que semeia ciência. Dados que cultivam soluções para o futuro."
        tone="social"
        metrics={
          <>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Qualidade do ar</p>
              <p className="mt-2 text-3xl font-black text-brand-primary">{loading ? "--" : Math.round(Number(airQuality ?? 28))}</p>
              <p className="mt-1 text-sm text-text-secondary">índice geral AQI</p>
            </div>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Temperatura</p>
              <p className="mt-2 text-3xl font-black text-text-primary">{loading ? "--" : Number(temperature ?? 24.7).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</p>
              <p className="mt-1 text-sm text-text-secondary">campus Praia Vermelha</p>
            </div>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Umidade</p>
              <p className="mt-2 text-3xl font-black text-text-primary">{loading ? "--" : Math.round(Number(humidity ?? 68))}%</p>
              <p className="mt-1 text-sm text-text-secondary">leitura pública local</p>
            </div>
          </>
        }
        aside={
          <div className="space-y-5">
            <p className="home-intro">
              Plataforma pública da UFF para monitoramento, análise e divulgação de dados ambientais com transparência,
              rigor técnico e compromisso social.
            </p>

            <form
              className="home-search"
              role="search"
              aria-label="Busca no portal SEMEAR"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const q = String(form.get("q") || "").trim();
                if (q) window.location.href = `/buscar?q=${encodeURIComponent(q)}`;
              }}
            >
              <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
              </svg>
              <input
                aria-label="Buscar no portal SEMEAR"
                name="q"
                type="search"
                placeholder="Buscar relatórios, notas técnicas, boletins, anexos..."
              />
              <button type="submit">Buscar</button>
            </form>

            <div className="home-popular">
              <span>Buscas populares:</span>
              <Link to="/relatorios">Relatórios 2024</Link>
              <Link to="/relatorios">Boletins mensais</Link>
              <Link to="/relatorios">Notas técnicas</Link>
              <Link to="/conversar">Atividades recentes</Link>
            </div>

            <div className="home-dandelion" aria-hidden="true">
              <svg viewBox="0 0 400 400" className="w-full h-full text-brand-primary" fill="none" stroke="currentColor">
                <defs>
                  <linearGradient id="dandelion-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#00b7b1" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#005daa" stopOpacity="0.75" />
                  </linearGradient>
                </defs>
                <path d="M200,200 Q195,330 220,380" stroke="url(#dandelion-grad)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="200" cy="200" r="12" fill="url(#dandelion-grad)" />
                <circle cx="200" cy="200" r="26" stroke="url(#dandelion-grad)" strokeWidth="1" strokeDasharray="3,3" className="animate-spin-slow" style={{ transformOrigin: "200px 200px" }} />
                {Array.from({ length: 14 }).map((_, i) => {
                  const angle = (i * 360) / 14;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 200 + Math.cos(rad) * 12;
                  const y1 = 200 + Math.sin(rad) * 12;
                  const x2 = 200 + Math.cos(rad) * 80;
                  const y2 = 200 + Math.sin(rad) * 80;
                  const seedX = 200 + Math.cos(rad) * 90;
                  const seedY = 200 + Math.sin(rad) * 90;
                  return (
                    <g key={i} className="opacity-70 hover:opacity-100 transition-opacity duration-300">
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#dandelion-grad)" strokeWidth="1.5" />
                      <line
                        x1={x2 - Math.sin(rad) * 5}
                        y1={y2 + Math.cos(rad) * 5}
                        x2={x2 + Math.sin(rad) * 5}
                        y2={y2 - Math.cos(rad) * 5}
                        stroke="url(#dandelion-grad)"
                        strokeWidth="1.2"
                      />
                      <circle cx={seedX} cy={seedY} r="2" fill="url(#dandelion-grad)" />
                    </g>
                  );
                })}
                <g className="animate-pulse">
                  <path d="M120,80 Q105,70 95,85" stroke="url(#dandelion-grad)" strokeWidth="1" />
                  <circle cx="95" cy="85" r="2" fill="url(#dandelion-grad)" />
                </g>
                <g className="animate-pulse" style={{ animationDelay: "1s" }}>
                  <path d="M280,70 Q300,55 315,65" stroke="url(#dandelion-grad)" strokeWidth="1" />
                  <circle cx="315" cy="65" r="2" fill="url(#dandelion-grad)" />
                </g>
                <g className="animate-pulse" style={{ animationDelay: "2s" }}>
                  <path d="M320,150 Q340,135 348,152" stroke="url(#dandelion-grad)" strokeWidth="1" />
                  <circle cx="348" cy="152" r="2" fill="url(#dandelion-grad)" />
                </g>
              </svg>
            </div>

            <section className="home-now" aria-label="Dados agora" aria-live="polite">
              <div className="home-now-head">
                <h2>Dados agora</h2>
                <span><i />Atualizado há 2 min</span>
              </div>
              <div className="home-now-list">
                <div className="home-now-row">
                  <span className="home-now-icon"><Icon name="chart" /></span>
                  <div>
                    <strong>Qualidade do Ar (UFF)</strong>
                    <small>Índice Geral</small>
                  </div>
                  <em>Boa</em>
                  <b>{loading ? "--" : Math.round(Number(airQuality ?? 28))}<small>AQI</small></b>
                </div>
                <div className="home-now-row">
                  <span className="home-now-icon"><Icon name="calendar" /></span>
                  <div>
                    <strong>Temperatura</strong>
                    <small>Campus Praia Vermelha</small>
                  </div>
                  <b>{loading ? "--" : Number(temperature ?? 24.7).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}<small>°C</small></b>
                </div>
                <div className="home-now-row">
                  <span className="home-now-icon"><Icon name="archive" /></span>
                  <div>
                    <strong>Umidade Relativa</strong>
                    <small>Campus Praia Vermelha</small>
                  </div>
                  <b>{loading ? "--" : Math.round(Number(humidity ?? 68))}<small>%</small></b>
                </div>
              </div>
              <Link to="/dados" className="home-now-link">Ver todos os indicadores <span>+</span></Link>
            </section>
          </div>
        }
      />
      {/* Banner de Lançamento do Observatório do Ar - Tijolo 57 */}
      <div className="home-inea-launch-banner my-8 p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center gap-6 justify-between animate-fade-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 max-w-4xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            Lançamento Oficial
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
            Quem respira esse ar? Conheça o novo Observatório do Ar de Volta Redonda
          </h2>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Volta Redonda agora tem um Observatório do Ar com dados públicos, mapas, séries históricas, meteorologia, exposição social e metodologia aberta. Uma ferramenta robusta para priorização territorial e cobrança pública de melhorias ambientais.
          </p>
          
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 text-xs pt-1">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Poluentes Monitorados</span>
              <p className="text-slate-200 font-semibold">PM₁₀, PM₂.₅, SO₂ e CO</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Análises e Recursos</span>
              <p className="text-slate-200 font-semibold">Séries históricas, Meteorologia e dispersão de ventos</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Dados e Metodologia</span>
              <p className="text-slate-200 font-semibold">Dados abertos e Metodologia pública de justiça ambiental</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-semibold">
            <span>⚠️ *Esta ferramenta não representa monitoramento ao vivo ou leitura minuto a minuto.</span>
            <span>*Não mede risco epidemiológico individual.</span>
            <span>*Não prova causalidade direta isolada.</span>
          </div>
        </div>
        
        <div className="shrink-0 relative z-10 w-full lg:w-auto">
          <Link
            to="/qualidade-ar/inea"
            className="inline-flex w-full lg:w-auto items-center justify-center min-h-[44px] px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-black uppercase tracking-[0.14em] text-xs rounded-xl shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5"
          >
            Acesse o mapa: Quem respira esse ar? &rarr;
          </Link>
        </div>
      </div>

      {/* Banner de Destaque das Análises INEA */}
      <div className="home-inea-history-banner my-8 p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 justify-between animate-fade-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            Análise Especial
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
            O que os dados oficiais revelam — e escondem — sobre o ar de Volta Redonda?
          </h2>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Organizamos a base pública do INEA de 2022 a fevereiro de 2025. Ela mostra onde há leitura, onde há alerta e onde há silêncio.
          </p>
          <p className="text-[10px] text-slate-400">
            * Base pública de índices e subíndices IQAr. Não representa leitura instantânea do ar e não é monitoramento minuto a minuto.
          </p>
        </div>
        <div className="shrink-0 relative z-10">
          <Link
            to="/qualidade-ar/inea"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-black uppercase tracking-[0.14em] text-xs rounded-xl shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5"
          >
            Acessar Radar do Ar &rarr;
          </Link>
        </div>
      </div>

      {/* Banner de Destaque dos Episódios de Atenção */}
      <div className="home-inea-episodes-banner my-8 p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 justify-between animate-fade-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            Sazonalidade e Limiares
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
            Quando o ar exige mais atenção?
          </h2>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Explore a linha do tempo 2022–2024 e veja os meses, estações e poluentes com mais eventos de atenção.
          </p>
          <p className="text-[10px] text-slate-400">
            * Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito.
          </p>
        </div>
        <div className="shrink-0 relative z-10">
          <Link
            to="/qualidade-ar/inea#episodios"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-black uppercase tracking-[0.14em] text-xs rounded-xl shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5"
          >
            Ver episódios de atenção &rarr;
          </Link>
        </div>
      </div>

      {/* Banner de Destaque da Exposição Social */}
      <div className="home-inea-social-banner my-8 p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center gap-6 justify-between animate-fade-in">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-3 max-w-3xl relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/25">
            Território e Justiça Ambiental
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
            Quem respira esse ar? Exposição Social e Vulnerabilidade
          </h2>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">
            Consulte a nova camada do Observatório que cruza a demografia do Censo 2022 com a localização de escolas, creches, UBSFs, CRAS e a usina siderúrgica.
          </p>
          <p className="text-[10px] text-slate-400">
            * Análise baseada em índice experimental de priorização territorial. Não mede risco epidemiológico individual.
          </p>
        </div>
        <div className="shrink-0 relative z-10">
          <Link
            to="/qualidade-ar/inea#exposicao-social"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-[0.14em] text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all hover:-translate-y-0.5"
          >
            Ver mapa de exposição social &rarr;
          </Link>
        </div>
      </div>

      <PortalSectionHeader
        eyebrow={<span className="badge-dados-abertos">Hub público SEMEAR</span>}
        title="Entradas principais do portal"
        subtitle="Acesse rapidamente o Observatório do Ar, os dados abertos, o acervo, os relatórios e a agenda pública."
      />
      <nav className="home-card-grid" aria-label="Principais áreas do portal">
        {navCards.map((card) => (
          <Link key={card.to} to={card.to} className="home-feature-card">
            <span className={card.tone === "green" ? "home-feature-icon green" : "home-feature-icon"}>
              <Icon name={card.icon} />
            </span>
            <span>
              <strong>{card.label}</strong>
              <small>{card.copy}</small>
            </span>
            <i aria-hidden="true">→</i>
          </Link>
        ))}
      </nav>

      <div className="home-lower-grid">
        <section className="home-news">
          <div className="home-section-head">
            <h2>Relatórios recentes</h2>
            <Link to="/relatorios">Ver todos</Link>
          </div>
          {(loading ? Array.from({ length: 3 }, () => null) : news).map((item, index) => {
            if (!item) {
              return <div key={index} className="home-news-skeleton" role="status" aria-label="Carregando novidade" />;
            }
            return (
              <Link key={item.key} to={item.to} className="home-news-row">
                <span className={index === 1 ? "green" : ""}><Icon name={index === 1 ? "archive" : "file"} /></span>
                <small>{item.date}</small>
                <strong><em>{item.type}</em>{item.title}</strong>
                <i aria-hidden="true">→</i>
              </Link>
            );
          })}
          {!loading && news.length === 0 && (
            <p className="home-empty">Nenhum relatório publicado no momento.</p>
          )}
        </section>
      </div>

      {events.length > 0 && (
        <section className="home-agenda-strip">
          <div>
            <h2>Agenda</h2>
            <p>Próximas atividades do projeto</p>
          </div>
          {events.slice(0, 3).map((event) => (
            <Link key={event.id} to="/agenda">
              <strong>{event.title}</strong>
              <small>{formatDate(event.start_at)}</small>
            </Link>
          ))}
        </section>
      )}

      <img className="home-logo-preload" src="/brand/semear-logo-full.jpeg" alt="" aria-hidden="true" />
      <span className="home-seed home-seed-a" aria-hidden="true" />
      <span className="home-seed home-seed-b" aria-hidden="true" />
    </PortalPageShell>
  );
}

