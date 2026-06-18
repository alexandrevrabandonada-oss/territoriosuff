import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { PortalEmptyState, PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";
import { getEventById } from "../lib/api/content";
import type { Event } from "../lib/api/core";
import { trackShare } from "../lib/observability";

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", {
    dateStyle: "full",
    timeStyle: "short"
  });
}

function getEventText(event: Event, key: string) {
  const value = event[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getEventLocation(event: Event) {
  return getEventText(event, "location_name") || getEventText(event, "location") || "Local não informado";
}

function getEventStatusLabel(event: Event) {
  const status = getEventText(event, "status") || "published";
  const labels: Record<string, string> = {
    published: "Publicado",
    completed: "Realizado",
    cancelled: "Cancelado",
    draft: "Rascunho"
  };
  return labels[status] ?? status;
}

function getRegistrationEnabled(event: Event) {
  return event.registration_enabled !== false;
}

export function AgendaDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      if (!eventId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setEvent(await getEventById(eventId));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar evento.";
        setError(`${message}${ENV_HINT}`);
      } finally {
        setLoading(false);
      }
    }

    void run();
  }, [eventId]);

  const description = event ? getEventText(event, "description") : null;
  const registrationEnabled = event ? getRegistrationEnabled(event) : false;

  return (
    <PortalPageShell>
      <PortalHero
        tone="warm"
        badge={<span className="badge-dados-abertos">Agenda pública</span>}
        title={event ? event.title : "Detalhe do evento"}
        subtitle="Página pública do evento com data, local, status, orientação de participação e link de compartilhamento."
        aside={
          <div className="rounded-[1.8rem] border border-white/10 bg-white/10 p-5 text-white backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <IconShell tone="warm" className="portal-stage-icon">
                <span aria-hidden="true">📌</span>
              </IconShell>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Transparência operacional</div>
                <div className="mt-1 text-base font-black">Cada evento deve ter status, data, local e chamada pública verificável.</div>
              </div>
            </div>
          </div>
        }
      />

      {loading ? (
        <SurfaceCard className="portal-list-panel p-6">
          <p className="text-base text-text-secondary">Carregando evento...</p>
        </SurfaceCard>
      ) : null}

      {!loading && !event ? (
        <PortalEmptyState
          title="Evento não encontrado"
          description="O evento informado não está disponível. Consulte a agenda pública para ver atividades publicadas."
          actions={
            <Link to="/agenda" className="ui-btn-primary">
              Voltar para agenda
            </Link>
          }
        />
      ) : null}

      {event ? (
        <SurfaceCard className="portal-list-panel overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-6 md:p-8">
              <PortalSectionHeader
                eyebrow={<span className="badge-metodologia">{getEventStatusLabel(event)}</span>}
                title={event.title}
                subtitle={description || "Evento publicado na agenda pública do SEMEAR."}
              />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-brand-primary/10 bg-white p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Data e horário</div>
                  <p className="mt-2 text-base font-black text-text-primary">{formatDate(String(event.start_at ?? ""))}</p>
                </div>
                <div className="rounded-2xl border border-brand-primary/10 bg-white p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Local</div>
                  <p className="mt-2 text-base font-black text-text-primary">{getEventLocation(event)}</p>
                </div>
                <div className="rounded-2xl border border-brand-primary/10 bg-white p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Bairro</div>
                  <p className="mt-2 text-base font-black text-text-primary">{getEventText(event, "bairro") || "Não informado"}</p>
                </div>
                <div className="rounded-2xl border border-brand-primary/10 bg-white p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Participação</div>
                  <p className="mt-2 text-base font-black text-text-primary">
                    {registrationEnabled ? "Inscrição aberta pelo portal" : "Confirmação operacional pela equipe"}
                  </p>
                </div>
                <div className="rounded-2xl border border-brand-primary/10 bg-white p-4 md:col-span-2">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Última atualização operacional</div>
                  <p className="mt-2 text-base font-black text-text-primary">
                    {getEventText(event, "updated_at") ? formatDate(String(event.updated_at)) : "Não informada"}
                  </p>
                </div>
              </div>
            </div>
            <aside className="bg-gradient-to-br from-brand-primary via-sky-700 to-emerald-600 p-6 text-white md:p-8">
              <div className="rounded-[1.5rem] border border-white/15 bg-white/12 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Ações</div>
                <div className="mt-4 grid gap-3">
                  {registrationEnabled ? (
                    <Link className="ui-btn-primary bg-white text-brand-primary hover:bg-white/90" to={`/inscricoes?eventId=${encodeURIComponent(event.id)}`}>
                      Inscrever-se
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full border border-white/25 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/20"
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/s/agenda/${event.id}`;
                      trackShare("agenda", event.id, "agenda-detail");
                      if (navigator.share) {
                        navigator.share({ title: event.title, url: shareUrl }).catch(console.error);
                      } else {
                        void navigator.clipboard.writeText(shareUrl);
                        alert("Link copiado!");
                      }
                    }}
                  >
                    Compartilhar evento
                  </button>
                  <Link className="rounded-full border border-white/25 bg-white/10 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-white/20" to="/agenda">
                    Ver agenda completa
                  </Link>
                </div>
              </div>
              <div className="mt-4 rounded-[1.5rem] border border-white/15 bg-white/12 p-5 text-sm leading-relaxed text-white/82">
                Publicação exibida como dado operacional. Mudanças de data, local, cancelamento ou confirmação devem ser atualizadas pela equipe administrativa.
              </div>
            </aside>
          </div>
        </SurfaceCard>
      ) : null}

      {error ? (
        <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
          {error}
        </p>
      ) : null}
    </PortalPageShell>
  );
}
