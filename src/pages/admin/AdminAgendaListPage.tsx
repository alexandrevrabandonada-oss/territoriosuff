import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

interface EventItem {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  status: string;
  capacity: number;
  location_name: string;
  bairro: string;
  updated_at?: string;
  registrations: { count: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  completed: "Realizado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export function AdminAgendaListPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadEvents = useCallback(async () => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        registrations(count)
      `)
      .order("start_at", { ascending: false });

    if (error) {
      console.error("[Agenda] Erro ao carregar:", error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const copyLink = (eventId: string) => {
    const url = `${window.location.origin}/agenda/${eventId}`;
    navigator.clipboard.writeText(url);
    alert("Link público do evento copiado!");
  };

  return (
    <div className="admin-list-page space-y-8 animate-in fade-in duration-500">
      <div className="admin-list-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Operação territorial</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Agenda & Territórios</h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">Gestão de eventos, oficinas, inscrições e atividades de campo.</p>
        </div>
        <Link 
          to="/admin/agenda/novo"
          className="admin-command-cta"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Evento
        </Link>
      </div>

      <div className="admin-table-shell overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Carregando atividades...</div>
        ) : events.length === 0 ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Nenhum evento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Eventos administrativos com data, local, ocupação, status e ações.</caption>
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th scope="col" className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Local</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ocupação</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {events.map((event) => {
                  const regCount = event.registrations?.[0]?.count || 0;
                  const capacity = event.capacity || 0;
                  const isFull = capacity > 0 && regCount >= capacity;
                  const waitlist = capacity > 0 && regCount > capacity ? regCount - capacity : 0;
                  
                  return (
                    <tr key={event.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-bold text-slate-900 leading-snug">{event.title}</p>
                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{event.bairro || "Sul Fluminense"}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-700">
                          {new Date(event.start_at).toLocaleDateString("pt-BR")} às {new Date(event.start_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{event.location_name || "Local a definir"}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5 max-w-[120px]">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                            <span className={isFull ? "text-rose-600" : "text-emerald-600"}>
                              {regCount} {waitlist > 0 && <span className="text-rose-400">({waitlist} fila)</span>}
                            </span>
                            <span className="text-slate-300">/ {capacity || "∞"}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full transition-all ${isFull ? "bg-rose-500" : "bg-emerald-500"}`} 
                              style={{ width: `${Math.min(100, (regCount / (capacity || regCount || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[event.status]}`}>
                          {STATUS_LABELS[event.status]}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => copyLink(event.id)}
                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Copiar Link Público"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/agenda/${event.id}/inscricoes`)}
                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Ver Inscritos"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/agenda/${event.id}`)}
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
