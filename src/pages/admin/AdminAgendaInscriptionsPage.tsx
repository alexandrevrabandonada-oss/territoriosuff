import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

interface Registration {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  bairro: string;
  created_at: string;
}

export function AdminAgendaInscriptionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!supabase || !id) return;
    setLoading(true);

    const { data: evt } = await supabase.from("events").select("title").eq("id", id).single();
    setEvent(evt);

    const { data: regs, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Agenda] Erro ao carregar inscritos:", error);
    } else {
      setRegistrations(regs || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = ["Nome", "Email", "WhatsApp", "Bairro", "Data Inscricao"];
    const rows = registrations.map(reg => [
      reg.name,
      reg.email,
      reg.whatsapp || "",
      reg.bairro || "",
      new Date(reg.created_at).toLocaleString("pt-BR")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inscritos_${event?.title?.replace(/[^a-z0-9]/gi, "_").toLowerCase() || id}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-20 text-center text-slate-400 italic">Carregando inscritos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate("/admin/agenda")}
            className="text-slate-400 hover:text-slate-600 flex items-center gap-2 mb-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-bold">Voltar para Agenda</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inscrições</h1>
          <p className="text-slate-500 mt-1">{event?.title}</p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={registrations.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total de Inscritos</p>
          <p className="text-4xl font-black text-emerald-600">{registrations.length}</p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Lista de Participantes</h2>
          {registrations.length === 0 ? (
            <p className="text-sm text-slate-400 italic py-8 text-center">Nenhuma inscrição realizada até o momento.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Nome / Email</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">WhatsApp</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Bairro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {registrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{reg.name}</p>
                        <p className="text-xs text-slate-500">{reg.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{reg.whatsapp || "--"}</td>
                      <td className="px-4 py-3 text-slate-600">{reg.bairro || "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
