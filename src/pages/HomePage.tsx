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
          <div className="home-dandelion-head" />
          <div className="home-dandelion-stem" />
          <div className="home-dandelion-leaf home-dandelion-leaf-a" />
          <div className="home-dandelion-leaf home-dandelion-leaf-b" />
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
          {(loading ? Array.from({ length: 3 }, (_, index) => null) : news).map((item, index) => {
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
