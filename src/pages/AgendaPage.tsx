import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { PortalEmptyState, PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";
import { listUpcomingEvents, type Event } from "../lib/api";
import { trackShare } from "../lib/observability";

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

export function AgendaPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setError(null);
        const data = await listUpcomingEvents();
        setEvents(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar agenda.";
        setError(`${message}${ENV_HINT}`);
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, []);

  return (
    <PortalPageShell>
      <PortalHero
        tone="warm"
        badge={<span className="badge-dados-abertos">Agenda pública e participação</span>}
        title="Agenda pública SEMEAR"
        subtitle="Oficinas, rodas de conversa, atividades de campo e encontros abertos organizados para aproximar dados ambientais da comunidade."
        metrics={
          <>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Próximos encontros</div>
              <div className="mt-2 text-3xl font-black">{loading ? "..." : events.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Vocação</div>
              <div className="mt-2 text-lg font-black">Escuta, mobilização e presença</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Próximo passo</div>
              <div className="mt-2 text-lg font-black">Inscreva-se ou compartilhe</div>
            </div>
          </>
        }
        aside={
          <div className="rounded-[1.8rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <IconShell tone="warm" className="portal-stage-icon">
                <span aria-hidden="true">📅</span>
              </IconShell>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Participação pública</div>
                <div className="mt-1 text-base font-black">Atividades abertas para território, dados e educação ambiental.</div>
              </div>
            </div>
          </div>
        }
      />

      <SurfaceCard className="portal-list-panel p-5 md:p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-metodologia">Programação pública</span>}
          title="Próximos encontros"
          subtitle="Acompanhe eventos publicados, compartilhe com a comunidade e avance para inscrição quando a atividade estiver aberta."
        />
        {loading ? <p className="text-base text-text-secondary">Carregando eventos...</p> : null}
        {!loading && !events.length ? (
          <PortalEmptyState
            title="Nenhum evento publicado no momento"
            description="Enquanto a agenda pública não recebe novos encontros, você pode explorar relatórios, conversar com o território e acompanhar os dados ambientais do portal."
            actions={
              <>
                <Link to="/dados" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left transition-colors hover:bg-emerald-100">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Ver dados</div>
                  <div className="mt-2 text-sm font-black text-emerald-950">Abrir painel público</div>
                </Link>
                <Link to="/relatorios" className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Ler evidências</div>
                  <div className="mt-2 text-sm font-black text-slate-900">Explorar relatórios</div>
                </Link>
                <Link to="/conversar" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left transition-colors hover:bg-rose-100">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-700">Escuta pública</div>
                  <div className="mt-2 text-sm font-black text-rose-950">Ir para conversas e atividades</div>
                </Link>
                <Link to="/qualidade-ar/inea" className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-left transition-colors hover:bg-cyan-100">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-700">Radar INEA</div>
                  <div className="mt-2 text-sm font-black text-cyan-950">Acessar observatório do ar</div>
                </Link>
              </>
            }
          />
        ) : null}
        {events.length ? (
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                className="portal-event-row"
                key={event.id}
              >
                <div className="flex-1">
                  <p className="text-lg font-black text-text-primary">{String(event.title ?? "Sem título")}</p>
                  <p className="mt-1 text-sm text-text-secondary">Inicio: {formatDate(String(event.start_at ?? ""))}</p>
                  <p className="text-sm text-text-secondary">
                    Local: {typeof event.location === "string" && event.location.trim() ? event.location : "Local nao informado."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="ui-btn-ghost"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/s/agenda/${event.id}`;
                      trackShare("agenda", event.id, "agenda");
                      if (navigator.share) {
                        navigator.share({
                          title: String(event.title),
                          url: shareUrl
                        }).catch(console.error);
                      } else {
                        trackShare("agenda", event.id, "agenda-copy");
                        void navigator.clipboard.writeText(shareUrl);
                        alert("Link copiado!");
                      }
                    }}
                  >
                    Compartilhar
                  </button>
                  <Link
                    className="ui-btn-primary"
                    to={`/inscricoes?eventId=${encodeURIComponent(event.id)}`}
                  >
                    Inscrever-se
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </SurfaceCard>

      {error ? (
        <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
          {error}
        </p>
      ) : null}
    </PortalPageShell>
  );
}
