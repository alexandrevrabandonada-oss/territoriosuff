import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import type {
  AcervoCollection,
  AcervoItem,
  BlogPost,
  Event,
  ReportDocument,
  StationOverview,
  TransparencySummary
} from "../lib/api";

const REPORT_KIND_LABEL: Record<ReportDocument["kind"], string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota Técnica",
  boletim: "Boletim",
  anexo: "Anexo"
};

const navCards = [
  { to: "/dados", label: "Dados", copy: "Indicadores, séries históricas e monitoramento em tempo real.", tone: "blue", icon: "chart" },
  { to: "/acervo", label: "Acervo", copy: "Documentos, publicações e materiais técnicos.", tone: "green", icon: "archive" },
  { to: "/relatorios", label: "Relatórios", copy: "Relatórios, notas técnicas, boletins e anexos oficiais.", tone: "blue", icon: "file" },
  { to: "/agenda", label: "Agenda", copy: "Eventos, reuniões e atividades do projeto.", tone: "green", icon: "calendar" },
  { to: "/conversar", label: "Conversas e atividades", copy: "Registros de campo, escuta pública e ações no território.", tone: "blue", icon: "chat" }
];

const timeline = [
  { year: "2019", label: "Início do projeto SEMEAR na UFF" },
  { year: "2020", label: "Expansão da rede de monitoramento" },
  { year: "2021", label: "Primeiros relatórios e boletins públicos" },
  { year: "2022", label: "Modelagens ambientais e recortes territoriais" },
  { year: "2023", label: "Integração de dados e novos parceiros" },
  { year: "2024+", label: "Inovação contínua e impacto social" }
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
  const [latestBlog, setLatestBlog] = useState<BlogPost | null>(null);
  const [, setTransparency] = useState<TransparencySummary | null>(null);
  const [, setCollections] = useState<AcervoCollection[]>([]);
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [monitoringApi, contentApi, transparencyApi] = await Promise.all([
          import("../lib/api/monitoring"),
          import("../lib/api/content"),
          import("../lib/api/transparency")
        ]);
        const [stationsData, eventsData, acervoData, blogData, transData, collectionsData, reportsData] = await Promise.all([
          monitoringApi.getStationOverview(),
          contentApi.listUpcomingEvents(),
          contentApi.listAcervoItems({ featured: true, limit: 6 }),
          contentApi.listBlogPosts({ limit: 1 }),
          transparencyApi.getTransparencySummary(),
          contentApi.listFeaturedCollections(3),
          contentApi.listLatestReports(3)
        ]);
        setStations(stationsData);
        setEvents(eventsData.slice(0, 3));
        setAcervo(acervoData);
        setLatestBlog(blogData[0] || null);
        setTransparency(transData);
        setCollections(collectionsData as AcervoCollection[]);
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

  const news = useMemo(() => {
    const reportNews = reports.map((report) => ({
      key: report.id,
      to: `/relatorios/${report.slug}`,
      type: REPORT_KIND_LABEL[report.kind],
      date: formatDate(report.published_at) || String(report.year ?? ""),
      title: report.title
    }));
    if (latestBlog) {
      reportNews.push({
        key: latestBlog.id,
        to: `/blog/${latestBlog.slug}`,
        type: "Novidade",
        date: formatDate(latestBlog.published_at),
        title: latestBlog.title
      });
    }
    return reportNews.slice(0, 3);
  }, [latestBlog, reports]);

  return (
    <section className="home-mockup" aria-labelledby="home-title">
      <div className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">Monitoramento do ar - UFF</p>
          <p className="home-project">Projeto UFF</p>
          <h1 id="home-title" aria-label="Projeto UFF SEMEAR">
            <span>SEME</span><span>AR</span>
          </h1>
          <h2>Conhecimento que semeia ciência. Dados que cultivam soluções para o futuro.</h2>
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
      {/* Banner de Destaque da História INEA */}
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
          <p className="text-[10px] text-slate-450">
            * Base pública de índices e subíndices IQAr. Não representa leitura instantânea do ar e não é monitoramento minuto a minuto.
          </p>
        </div>
        <div className="shrink-0 relative z-10">
          <Link
            to="/qualidade-ar/inea/historia"
            className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-black uppercase tracking-[0.14em] text-xs rounded-xl shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5"
          >
            Acessar história do ar &rarr;
          </Link>
        </div>
      </div>

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
        <section className="home-timeline">
          <h2>Linha do Tempo</h2>
          <p>Acompanhe a evolução do projeto SEMEAR.</p>
          <div className="home-timeline-track">
            {timeline.map((item, index) => (
              <div key={item.year} className="home-timeline-item">
                <strong className={index === timeline.length - 1 ? "is-current" : ""}>{item.year}</strong>
                <span />
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="home-news">
          <div className="home-section-head">
            <h2>Destaques &amp; Novidades</h2>
            <Link to="/blog">Ver todas</Link>
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
            <p className="home-empty">Novidades em preparação.</p>
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
    </section>
  );
}
