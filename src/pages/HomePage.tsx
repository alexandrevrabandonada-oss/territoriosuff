import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/home.css";
import type {
  Event,
  ReportDocument
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

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const contentApi = await import("../lib/api/content");
        const [eventsData, pastEventsData, reportsData] = await Promise.all([
          contentApi.listUpcomingEvents(),
          contentApi.listRecentPastEvents(3),
          contentApi.listLatestReports(3)
        ]);
        setEvents(eventsData.slice(0, 3));
        setPastEvents(pastEventsData);
        setReports(reportsData.slice(0, 3));
      } catch (err) {
        console.error("Erro ao carregar dados da home:", err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

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
            <span className="badge-dados-abertos">Rede própria em implantação</span>
            <span className="badge-metodologia">Projeto UFF</span>
          </>
        }
        title={<span id="home-title" aria-label="Projeto UFF SEMEAR"><span>SEME</span><span>AR</span></span>}
        subtitle="Conhecimento que semeia ciência. Dados que cultivam soluções para o futuro."
        tone="social"
        metrics={
          <>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Monitoramento próprio</p>
              <p className="mt-2 text-3xl font-black text-brand-primary">Em implantação</p>
              <p className="mt-1 text-sm text-text-secondary">sensores UFF serão instalados em etapa posterior</p>
            </div>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Base pública atual</p>
              <p className="mt-2 text-3xl font-black text-text-primary">INEA</p>
              <p className="mt-1 text-sm text-text-secondary">dados abertos e séries históricas consolidadas</p>
            </div>
            <div className="portal-kpi-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Próxima etapa</p>
              <p className="mt-2 text-3xl font-black text-text-primary">Rede SEMEAR</p>
              <p className="mt-1 text-sm text-text-secondary">instalação, calibração e publicação metodológica</p>
            </div>
          </>
        }
        aside={
          <div className="space-y-5">
            <p className="home-intro">
              Plataforma pública da UFF para pesquisa, análise e divulgação de dados ambientais com transparência,
              rigor técnico e compromisso social. A rede própria de sensores será publicada após instalação e validação.
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
              {reports.length > 0 ? (
                <>
                  <Link to="/relatorios">Relatórios publicados</Link>
                  <Link to="/relatorios">Notas e boletins</Link>
                </>
              ) : (
                <>
                  <Link to="/dados">Dados abertos</Link>
                  <Link to="/qualidade-ar/inea">Radar do Ar</Link>
                </>
              )}
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

            <section className="home-now" aria-label="Status da implantação da rede SEMEAR" aria-live="polite">
              <div className="home-now-head">
                <h2>Rede SEMEAR</h2>
                <span><i />Implantação futura</span>
              </div>
              <div className="home-now-list">
                <div className="home-now-row">
                  <span className="home-now-icon"><Icon name="chart" /></span>
                  <div>
                    <strong>Qualidade do ar própria</strong>
                    <small>Aguardando instalação dos equipamentos</small>
                  </div>
                  <em>Futuro</em>
                </div>
                <div className="home-now-row">
                  <span className="home-now-icon"><Icon name="calendar" /></span>
                  <div>
                    <strong>Meteorologia local</strong>
                    <small>Será publicada após calibração e validação</small>
                  </div>
                  <em>Planejada</em>
                </div>
                <div className="home-now-row">
                  <span className="home-now-icon"><Icon name="archive" /></span>
                  <div>
                    <strong>Transparência operacional</strong>
                    <small>Metodologia e status serão documentados publicamente</small>
                  </div>
                  <em>Aberta</em>
                </div>
              </div>
              <Link to="/qualidade-ar/inea" className="home-now-link">Ver dados públicos atuais <span>+</span></Link>
            </section>
          </div>
        }
      />
      <section className="home-observatory-hub" aria-labelledby="home-observatory-title">
        <div className="home-observatory-copy">
          <span>Observatório do Ar de Volta Redonda</span>
          <h2 id="home-observatory-title">Dados públicos para localizar, compreender e agir.</h2>
          <p>
            Reunimos mapa, séries históricas, cobertura da rede e leitura territorial em uma experiência única,
            com metodologia aberta e limites de uso explícitos.
          </p>
          <div className="home-observatory-note">
            Base pública do INEA e WebLakes. Não representa monitoramento em tempo real, diagnóstico individual ou prova causal isolada.
          </div>
        </div>
        <nav className="home-observatory-actions" aria-label="Explorar o Observatório do Ar">
          <Link to="/qualidade-ar/inea?modo=mapa">
            <strong>Mapa e estações</strong>
            <span>Veja onde há leitura e onde persistem lacunas.</span>
          </Link>
          <Link to="/qualidade-ar/inea?modo=tempo">
            <strong>Histórico e episódios</strong>
            <span>Compare anos, sazonalidade e cobertura.</span>
          </Link>
          <Link to="/qualidade-ar/inea?modo=territorio">
            <strong>Território e exposição</strong>
            <span>Explore prioridades de justiça ambiental.</span>
          </Link>
        </nav>
      </section>

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

      {events.length > 0 ? (
        <section className="home-agenda-strip">
          <div>
            <h2>Agenda</h2>
            <p>Próximas atividades do projeto</p>
          </div>
          {events.map((event) => (
            <Link key={event.id} to="/agenda">
              <strong>{event.title}</strong>
              <small><time dateTime={event.start_at}>{formatDate(event.start_at)}</time></small>
            </Link>
          ))}
        </section>
      ) : null}

      {pastEvents.length > 0 ? (
        <section className="home-agenda-strip home-agenda-strip-past" aria-labelledby="home-past-events-title">
          <div>
            <h2 id="home-past-events-title">Atividades realizadas</h2>
            <p>Registros recentes do projeto no território</p>
          </div>
          {pastEvents.map((event) => (
            <Link key={event.id} to="/agenda">
              <strong>{event.title}</strong>
              <small>Realizada em <time dateTime={event.start_at}>{formatDate(event.start_at)}</time></small>
            </Link>
          ))}
        </section>
      ) : null}

      <img className="home-logo-preload" src="/brand/semear-logo-full.jpeg" alt="" aria-hidden="true" />
      <span className="home-seed home-seed-a" aria-hidden="true" />
      <span className="home-seed home-seed-b" aria-hidden="true" />
    </PortalPageShell>
  );
}

