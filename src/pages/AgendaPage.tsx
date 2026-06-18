import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { IconShell, SurfaceCard } from "../components/BrandSystem";
import { PortalEmptyState, PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";
import { listUpcomingEvents } from "../lib/api/content";
import type { Event } from "../lib/api/core";
import { trackShare } from "../lib/observability";

const ENV_HINT = " Verifique .env.local (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).";

type CrasAction = {
  cras: string;
  date: string;
  weekday: string;
  time: string;
  address: string;
  territory: string;
};

const CRAS_ACTIONS_2026: CrasAction[] = [
  { cras: "CRAS São Carlos", date: "2026-06-15", weekday: "Segunda-feira", time: "14:30", address: "Rua Faria de Brito, s/nº - Bairro São Carlos", territory: "São Carlos" },
  { cras: "CRAS Açude", date: "2026-06-25", weekday: "Quinta-feira", time: "08:30", address: "Av. Francisco Antonio Francisco, s/nº - Bairro Açude", territory: "Açude" },
  { cras: "CRAS Monte Castelo", date: "2026-07-03", weekday: "Sexta-feira", time: "14:00", address: "Rua São Sebastião, nº 112 - Bairro Monte Castelo", territory: "Monte Castelo" },
  { cras: "CRAS Rústico", date: "2026-07-09", weekday: "Quinta-feira", time: "14:00", address: "Praça José Gonçalves Dias, nº 142 - Bairro Rústico", territory: "Rústico" },
  { cras: "CRAS Vila Rica (Igreja Viva Bem)", date: "2026-07-14", weekday: "Terça-feira", time: "09:00", address: "Rua 19, nº 135 - Bairro Vila Rica", territory: "Vila Rica" },
  { cras: "CRAS Padre Josimo", date: "2026-07-21", weekday: "Terça-feira", time: "14:30", address: "Rua 7, nº 101 - Bairro Padre Josimo", territory: "Padre Josimo" },
  { cras: "CRAS Açude", date: "2026-07-30", weekday: "Quinta-feira", time: "08:30", address: "Av. Francisco Antonio Francisco, s/nº - Bairro Açude", territory: "Açude" },
  { cras: "CRAS Monte Castelo", date: "2026-08-07", weekday: "Sexta-feira", time: "14:00", address: "Rua São Sebastião, nº 112 - Bairro Monte Castelo", territory: "Monte Castelo" },
  { cras: "CRAS Rústico", date: "2026-08-13", weekday: "Quinta-feira", time: "14:00", address: "Praça José Gonçalves Dias, nº 142 - Bairro Rústico", territory: "Rústico" },
  { cras: "CRAS da Siderlândia", date: "2026-08-20", weekday: "Quinta-feira", time: "09:00", address: "Rua 10, nº 20 - Bairro Siderlândia", territory: "Siderlândia" },
  { cras: "CRAS São Carlos", date: "2026-08-24", weekday: "Segunda-feira", time: "14:30", address: "Rua Faria de Brito, s/nº - Bairro São Carlos", territory: "São Carlos" },
  { cras: "CRAS São Cristóvão", date: "2026-08-28", weekday: "Sexta-feira", time: "14:00", address: "Rua Leopoldina, nº 460 - Bairro São Cristóvão", territory: "São Cristóvão" },
  { cras: "CRAS Padre Josimo", date: "2026-09-01", weekday: "Terça-feira", time: "14:30", address: "Rua 7, nº 101 - Bairro Padre Josimo", territory: "Padre Josimo" },
  { cras: "CRAS da Siderlândia", date: "2026-09-17", weekday: "Quinta-feira", time: "09:00", address: "Rua 10, nº 20 - Bairro Siderlândia", territory: "Siderlândia" },
  { cras: "CRAS Santa Rita de Cássia", date: "2026-09-18", weekday: "Sexta-feira", time: "09:00", address: "Rua da Granja, nº 40 - Bairro Santa Rita de Cássia", territory: "Santa Rita de Cássia" },
  { cras: "CRAS São Cristóvão", date: "2026-09-25", weekday: "Sexta-feira", time: "14:00", address: "Rua Leopoldina, nº 460 - Bairro São Cristóvão", territory: "São Cristóvão" },
  { cras: "CRAS Vila Rica (Igreja Viva Bem)", date: "2026-09-29", weekday: "Terça-feira", time: "09:00", address: "Rua 19, nº 135 - Bairro Vila Rica", territory: "Vila Rica" },
  { cras: "CRAS Eucaliptal (Jovens)", date: "2026-10-07", weekday: "Quarta-feira", time: "09:00", address: "Rua Baltazar de Souza, nº 500 - Bairro Eucaliptal", territory: "Eucaliptal" },
  { cras: "CRAS Santa Rita de Cássia", date: "2026-10-16", weekday: "Sexta-feira", time: "09:00", address: "Rua da Granja, nº 40 - Bairro Santa Rita de Cássia", territory: "Santa Rita de Cássia" },
  { cras: "CRAS Eucaliptal (Jovens)", date: "2026-11-11", weekday: "Quarta-feira", time: "09:00", address: "Rua Baltazar de Souza, nº 500 - Bairro Eucaliptal", territory: "Eucaliptal" }
];

const CRAS_SOURCE_UPDATED_AT = "18/06/2026";

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

function formatCrasDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatCrasMonth(value: string) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function getActionDateTime(action: CrasAction) {
  return new Date(`${action.date}T${action.time}:00-03:00`);
}

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function getEventLocation(event: Event) {
  const locationName = typeof event.location_name === "string" ? event.location_name : "";
  const location = typeof event.location === "string" ? event.location : "";
  return locationName.trim() || location.trim() || "Local não informado.";
}

function isCrasActionEvent(event: Event) {
  const type = typeof event.type === "string" ? event.type : "";
  const title = typeof event.title === "string" ? event.title : "";
  return type === "acao_territorial" || title.startsWith("Agenda de Ações SEMEAR - ");
}

function downloadCrasCalendar(actions: CrasAction[]) {
  const now = formatIcsDate(new Date());
  const events = actions.map((action) => {
    const start = getActionDateTime(action);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    return [
      "BEGIN:VEVENT",
      `UID:semear-cras-${action.date}-${action.territory.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}@semear`,
      `DTSTAMP:${now}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${escapeIcsText(`Agenda de Ações SEMEAR - ${action.cras}`)}`,
      `LOCATION:${escapeIcsText(action.address)}`,
      `DESCRIPTION:${escapeIcsText(`${action.weekday}, ${formatCrasDate(action.date)} às ${action.time}. Confirmação operacional pela equipe.`)}`,
      "END:VEVENT"
    ].join("\r\n");
  }).join("\r\n");
  const content = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SEMEAR//Agenda CRAS//PT-BR", "CALSCALE:GREGORIAN", events, "END:VCALENDAR"].join("\r\n");
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "agenda-acoes-cras-semear.ics";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AgendaPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("todos");
  const [selectedTerritory, setSelectedTerritory] = useState("todos");

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

  const now = new Date();
  const monthOptions = Array.from(new Set(CRAS_ACTIONS_2026.map((action) => action.date.slice(0, 7))));
  const territoryOptions = Array.from(new Set(CRAS_ACTIONS_2026.map((action) => action.territory))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const nextAction = CRAS_ACTIONS_2026.find((action) => getActionDateTime(action).getTime() >= now.getTime()) ?? CRAS_ACTIONS_2026[CRAS_ACTIONS_2026.length - 1];
  const filteredCrasActions = CRAS_ACTIONS_2026.filter((action) => {
    const byMonth = selectedMonth === "todos" || action.date.startsWith(selectedMonth);
    const byTerritory = selectedTerritory === "todos" || action.territory === selectedTerritory;
    return byMonth && byTerritory;
  });
  const crasActionCards = filteredCrasActions.slice(0, 6);
  const registrationEvents = events.filter((event) => !isCrasActionEvent(event));

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
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Eventos com inscrição</div>
              <div className="mt-2 text-3xl font-black">{loading ? "..." : registrationEvents.length}</div>
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

      <SurfaceCard className="overflow-hidden border-brand-primary/10 bg-gradient-to-br from-white via-sky-50/80 to-emerald-50/70 p-0 shadow-[0_28px_90px_rgba(0,93,170,0.12)]">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-sky-700 to-emerald-600 p-6 text-white md:p-8">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />
            <div className="absolute bottom-4 right-6 text-8xl font-black text-white/10" aria-hidden="true">SEMEAR</div>
            <span className="inline-flex rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/85">
              Agenda de Ações
            </span>
            <h2 className="mt-5 max-w-xl text-3xl font-black tracking-[-0.04em] md:text-5xl">
              Atendimentos territoriais nos CRAS em 2026
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/82">
              Programação organizada por data, horário e endereço para facilitar planejamento comunitário,
              presença territorial e acompanhamento público das ações do Projeto UFF SEMEAR.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/15 bg-white/12 p-4">
                <div className="text-3xl font-black">{CRAS_ACTIONS_2026.length}</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">ações</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/12 p-4">
                <div className="text-3xl font-black">10</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">territórios</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/12 p-4">
                <div className="text-3xl font-black">5</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">meses</div>
              </div>
            </div>
            <p className="mt-5 rounded-2xl border border-white/15 bg-white/12 p-4 text-sm font-semibold text-white/86">
              CRAS Jardim Belmonte: retorno a confirmar pela equipe.
            </p>
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/12 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Próxima ação prevista</div>
              <div className="mt-2 text-xl font-black">{nextAction.cras}</div>
              <p className="mt-1 text-sm text-white/82">
                {formatCrasDate(nextAction.date)} · {nextAction.weekday} · {nextAction.time}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{nextAction.address}</p>
            </div>
          </div>

          <div className="p-5 md:p-7">
            <PortalSectionHeader
              eyebrow={<span className="badge-metodologia">Planejar hoje, transformar sempre</span>}
              title="Calendário completo"
              subtitle="Lista validada a partir da agenda enviada, com a data de Padre Josimo ajustada para 21/07/2026 para preservar a sequência cronológica e o dia da semana."
            />
            <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-brand-primary/10 bg-white/80 p-4 md:grid-cols-3">
              <label className="text-sm font-bold text-text-primary">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Mês</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-text-primary outline-none focus:border-brand-primary"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                >
                  <option value="todos">Todos os meses</option>
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>{formatCrasMonth(`${month}-01`)}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold text-text-primary">
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">Território</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-text-primary outline-none focus:border-brand-primary"
                  value={selectedTerritory}
                  onChange={(event) => setSelectedTerritory(event.target.value)}
                >
                  <option value="todos">Todos os territórios</option>
                  {territoryOptions.map((territory) => (
                    <option key={territory} value={territory}>{territory}</option>
                  ))}
                </select>
              </label>
              <div className="rounded-2xl bg-brand-primary-soft p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary-dark">Resultado</div>
                <div className="mt-2 text-3xl font-black text-brand-primary-dark">{filteredCrasActions.length}</div>
                <p className="text-xs font-semibold text-text-secondary">ações encontradas nos filtros atuais</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="ui-btn-primary"
                onClick={() => downloadCrasCalendar(filteredCrasActions)}
                disabled={!filteredCrasActions.length}
              >
                Baixar calendário (.ics)
              </button>
              <button
                type="button"
                className="ui-btn-ghost"
                onClick={() => {
                  setSelectedMonth("todos");
                  setSelectedTerritory("todos");
                }}
              >
                Limpar filtros
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {crasActionCards.map((action) => (
                <article key={`${action.cras}-${action.date}`} className="rounded-[1.25rem] border border-brand-primary/10 bg-white/85 p-4 shadow-[0_12px_30px_rgba(17,38,59,0.06)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary-dark">{action.weekday}</p>
                      <h3 className="mt-1 text-base font-black text-text-primary">{action.cras}</h3>
                    </div>
                    <div className="rounded-2xl bg-brand-primary px-3 py-2 text-center text-white">
                      <div className="text-sm font-black">{formatCrasDate(action.date).slice(0, 5)}</div>
                      <div className="text-[10px] font-black">{action.time}</div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{action.address}</p>
                </article>
              ))}
            </div>
            {!filteredCrasActions.length ? (
              <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                Nenhuma ação encontrada para estes filtros. Ajuste mês ou território para consultar a agenda completa.
              </p>
            ) : null}
          </div>
        </div>

        <div className="border-t border-brand-primary/10 bg-white/80 p-4 md:p-6">
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Fonte</div>
              <p className="mt-2 text-sm font-bold text-text-primary">Agenda de ações enviada pelo Projeto UFF SEMEAR.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Última atualização</div>
              <p className="mt-2 text-sm font-bold text-text-primary">{CRAS_SOURCE_UPDATED_AT}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Status operacional</div>
              <p className="mt-2 text-sm font-bold text-text-primary">Locais e horários publicados para planejamento; confirmação final pela equipe.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-[0.16em] text-text-secondary">
                  <th className="px-3 py-2">CRAS</th>
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Horário</th>
                  <th className="px-3 py-2">Endereço</th>
                </tr>
              </thead>
              <tbody>
                {filteredCrasActions.map((action) => (
                  <tr key={`${action.cras}-${action.date}-table`} className="bg-white shadow-[0_8px_24px_rgba(17,38,59,0.04)]">
                    <td className="rounded-l-2xl px-3 py-3 font-black text-text-primary">{action.cras}</td>
                    <td className="px-3 py-3 text-text-secondary">{formatCrasDate(action.date)} · {action.weekday}</td>
                    <td className="px-3 py-3 font-black text-brand-primary-dark">{action.time}</td>
                    <td className="rounded-r-2xl px-3 py-3 text-text-secondary">{action.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-5 md:p-6">
        <PortalSectionHeader
          eyebrow={<span className="badge-metodologia">Programação pública</span>}
          title="Eventos com inscrição"
          subtitle="Esta lista separa oficinas e encontros com formulário próprio da campanha territorial CRAS, evitando duplicidade e melhorando a leitura pública."
        />
        {loading ? <p className="text-base text-text-secondary">Carregando eventos...</p> : null}
        {!loading && !registrationEvents.length ? (
          <PortalEmptyState
            title="Nenhum evento com inscrição aberta no momento"
            description="A campanha territorial CRAS está publicada acima. Quando houver oficinas ou encontros com formulário próprio, eles aparecerão nesta seção."
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
        {registrationEvents.length ? (
          <ul className="space-y-4">
            {registrationEvents.map((event) => (
              <li
                className="portal-event-row"
                key={event.id}
              >
                <div className="flex-1">
                  <p className="text-lg font-black text-text-primary">{String(event.title ?? "Sem título")}</p>
                  <p className="mt-1 text-sm text-text-secondary">Início: {formatDate(String(event.start_at ?? ""))}</p>
                  <p className="text-sm text-text-secondary">Local: {getEventLocation(event)}</p>
                </div>
                <div className="flex gap-2">
                  <Link className="ui-btn-ghost" to={`/agenda/${encodeURIComponent(event.id)}`}>
                    Detalhes
                  </Link>
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
                  {event.registration_enabled === false ? (
                    <span className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold leading-none text-text-secondary">
                      Confirmação pela equipe
                    </span>
                  ) : (
                    <Link
                      className="ui-btn-primary"
                      to={`/inscricoes?eventId=${encodeURIComponent(event.id)}`}
                    >
                      Inscrever-se
                    </Link>
                  )}
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
