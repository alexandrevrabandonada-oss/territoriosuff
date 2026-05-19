import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { createRegistration, getEventSummary, type EventSummary } from "../lib/api";

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  bairro: string;
  consent_lgpd: boolean;
};

const initialForm: FormState = {
  name: "",
  email: "",
  whatsapp: "",
  bairro: "",
  consent_lgpd: false
};

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

export function InscricoesPage() {
  const [searchParams] = useSearchParams();
  const eventId = useMemo(() => searchParams.get("eventId"), [searchParams]);

  const [event, setEvent] = useState<EventSummary | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const safeEventId = eventId ?? "";
    if (!safeEventId) {
      setEvent(null);
      return;
    }

    async function run() {
      try {
        setLoadingEvent(true);
        setError(null);
        const data = await getEventSummary(safeEventId);
        setEvent(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao carregar evento.";
        setError(`${message}${ENV_HINT}`);
      } finally {
        setLoadingEvent(false);
      }
    }

    void run();
  }, [eventId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      if (!event?.id) {
        throw new Error("Selecione um evento valido na agenda antes de enviar a inscricao.");
      }

      const result = await createRegistration({
        event_id: event.id,
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        bairro: form.bairro,
        consent_lgpd: form.consent_lgpd
      });
      if (result.status === "waitlist") {
        setSuccess("Inscricao recebida na lista de espera. A equipe confirmara por contato.");
      } else {
        setSuccess("Inscricao confirmada com sucesso. A equipe enviara as proximas orientacoes.");
      }
      setForm(initialForm);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel concluir a inscricao.";
      setError(`${message}${ENV_HINT}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="portal-stage inscriptions-stage space-y-8 md:space-y-10">
      <SurfaceCard className="portal-stage-hero portal-stage-hero-warm overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <IconShell tone="warm" className="portal-stage-icon"><span aria-hidden="true">📝</span></IconShell>
            <h1>Inscrições em eventos</h1>
            <p>Preencha o formulário para participar de oficinas, encontros públicos e atividades territoriais do projeto SEMEAR.</p>
          </div>
          <div className="portal-stage-stat">
            <span>{event ? "1" : "0"}</span>
            <small>evento selecionado</small>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-5 md:p-6">
        {loadingEvent ? <p className="text-base text-text-secondary">Carregando dados do evento...</p> : null}
        {event ? (
          <div className="mb-6 rounded-lg border border-brand-primary/30 bg-brand-primary-soft p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">Evento selecionado</p>
            <p className="mt-2 text-lg font-bold text-text-primary">{event.title}</p>
            <p className="mt-1 text-sm text-text-secondary">Início: {formatDate(event.start_at)}</p>
            <p className="text-sm text-text-secondary">Local: {event.location?.trim() ? event.location : "Local não informado."}</p>
          </div>
        ) : eventId && !loadingEvent && !error ? (
          <p className="mb-6 text-base text-text-secondary">Evento não encontrado para o ID informado.</p>
        ) : (
          <p className="mb-6 text-base text-text-secondary">Nenhum evento especificado. Acesse a <a href="/agenda" className="ui-link">agenda</a> para iniciar uma inscrição.</p>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="registration-name" className="mb-2 block text-base font-semibold text-text-primary">
              Nome completo <span className="text-danger" aria-label="obrigatório">*</span>
            </label>
            <input
              id="registration-name"
              className="w-full rounded-lg border-2 border-border-subtle bg-white px-4 py-3 text-base text-text-primary transition-colors placeholder:text-text-secondary/60 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              type="text"
              value={form.name}
              aria-required="true"
              placeholder="Digite seu nome completo"
            />
            <p className="mt-1 text-sm text-text-secondary">Informe seu nome como consta em documento oficial.</p>
          </div>

          <div>
            <label htmlFor="registration-email" className="mb-2 block text-base font-semibold text-text-primary">
              E-mail <span className="text-danger" aria-label="obrigatório">*</span>
            </label>
            <input
              id="registration-email"
              className="w-full rounded-lg border-2 border-border-subtle bg-white px-4 py-3 text-base text-text-primary transition-colors placeholder:text-text-secondary/60 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              type="email"
              value={form.email}
              aria-required="true"
              placeholder="exemplo@email.com"
            />
            <p className="mt-1 text-sm text-text-secondary">Usaremos este e-mail para confirmações e comunicados.</p>
          </div>

          <div>
            <label htmlFor="registration-whatsapp" className="mb-2 block text-base font-semibold text-text-primary">
              WhatsApp <span className="text-danger" aria-label="obrigatório">*</span>
            </label>
            <input
              id="registration-whatsapp"
              className="w-full rounded-lg border-2 border-border-subtle bg-white px-4 py-3 text-base text-text-primary transition-colors placeholder:text-text-secondary/60 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
              required
              type="tel"
              value={form.whatsapp}
              aria-required="true"
              placeholder="(21) 99999-9999"
            />
            <p className="mt-1 text-sm text-text-secondary">Número com DDD para contato direto.</p>
          </div>

          <div>
            <label htmlFor="registration-bairro" className="mb-2 block text-base font-semibold text-text-primary">
              Bairro <span className="text-danger" aria-label="obrigatório">*</span>
            </label>
            <input
              id="registration-bairro"
              className="w-full rounded-lg border-2 border-border-subtle bg-white px-4 py-3 text-base text-text-primary transition-colors placeholder:text-text-secondary/60 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              onChange={(e) => setForm((prev) => ({ ...prev, bairro: e.target.value }))}
              required
              type="text"
              value={form.bairro}
              aria-required="true"
              placeholder="Nome do bairro onde reside"
            />
            <p className="mt-1 text-sm text-text-secondary">Ajuda-nos a entender o alcance territorial do projeto.</p>
          </div>

          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <label htmlFor="registration-consent" className="flex items-start gap-3 text-base text-text-primary">
              <input
                id="registration-consent"
                checked={form.consent_lgpd}
                className="mt-1 h-5 w-5 flex-shrink-0 rounded border-2 border-border-subtle accent-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                onChange={(e) => setForm((prev) => ({ ...prev, consent_lgpd: e.target.checked }))}
                required
                type="checkbox"
                aria-required="true"
              />
              <span>
                Aceito o tratamento dos meus dados pessoais para fins de inscrição e comunicação sobre o evento, conforme a Lei Geral de Proteção de Dados (LGPD). <span className="text-danger" aria-label="obrigatório">*</span>
              </span>
            </label>
          </div>

          <button
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-brand-primary px-6 py-3 text-base font-bold text-white transition-all hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-brand-primary"
            disabled={submitting || !event?.id}
            type="submit"
            aria-busy={submitting}
          >
            {submitting ? (
              <>
                <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Enviando inscrição...
              </>
            ) : (
              "Enviar inscrição"
            )}
          </button>
        </form>
      </SurfaceCard>

      {success ? (
        <div aria-live="polite" className="rounded-lg border-2 border-success bg-success/10 p-4" role="status">
          <p className="flex items-start gap-2 text-base font-semibold text-success">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </p>
        </div>
      ) : null}
      {error ? (
        <div aria-live="assertive" className="rounded-lg border-2 border-danger bg-danger/10 p-4" role="alert">
          <p className="flex items-start gap-2 text-base font-semibold text-danger">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      ) : null}
    </section>
  );
}
