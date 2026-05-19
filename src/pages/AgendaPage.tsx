import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { IconShell, SurfaceCard } from "../components/BrandSystem";
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
    <section className="portal-stage space-y-8 md:space-y-10">
      <SurfaceCard className="portal-stage-hero portal-stage-hero-warm overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="warm" className="portal-stage-icon">
              <span aria-hidden="true">📅</span>
            </IconShell>
            <h1>Agenda pública SEMEAR</h1>
            <p>
              Oficinas, rodas de conversa, atividades de campo e encontros abertos organizados para aproximar dados ambientais da comunidade.
            </p>
          </div>
          <div className="portal-stage-stat">
            <span>{loading ? "..." : events.length}</span>
            <small>evento(s) disponível(is)</small>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-5 md:p-6">
        {loading ? <p className="text-base text-text-secondary">Carregando eventos...</p> : null}
        {!loading && !events.length ? (
          <p aria-live="polite" className="text-base text-text-secondary" role="status">
            Nenhum evento publicado no momento.
          </p>
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
    </section>
  );
}
