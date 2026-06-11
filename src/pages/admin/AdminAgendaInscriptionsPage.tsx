import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

interface Registration {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  bairro: string;
  status: string;
  created_at: string;
}

interface AgendaInscriptionsEvent {
  title: string;
  capacity: number | null;
}

const REG_STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmado",
  attended: "Presente",
  cancelled: "Cancelado",
  waiting: "Fila de Espera",
};

function escapeCSVField(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  const strValue = String(value);
  if (strValue.includes('"') || strValue.includes(",") || strValue.includes("\n") || strValue.includes("\r")) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }
  return strValue;
}

export function AdminAgendaInscriptionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<AgendaInscriptionsEvent | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase || !id) return;
    setLoading(true);

    const { data: evt } = await supabase.from("events").select("title, capacity").eq("id", id).single();
    setEvent(evt);

    const { data: regs, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Agenda] Erro ao carregar inscritos:", error);
    } else {
      // Processar fila de espera localmente se não estiver no banco (fallback operacional)
      const capacity = evt?.capacity || 0;
      const processedRegs = regs?.map((reg, index) => ({
        ...reg,
        status: (capacity > 0 && index >= capacity) ? "waiting" : reg.status
      })) || [];
      
      setRegistrations(processedRegs);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleAttendance = async (regId: string, currentStatus: string) => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    const newStatus = currentStatus === "attended" ? "confirmed" : "attended";
    
    const { error } = await supabase
      .from("registrations")
      .update({ status: newStatus })
      .eq("id", regId);

    if (error) {
      alert("Erro ao atualizar presença: " + error.message);
    } else {
      loadData();
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = ["Nome", "Email", "WhatsApp", "Bairro", "Status", "Data Inscrição"];
    const rows = registrations.map(reg => [
      reg.name,
      reg.email,
      reg.whatsapp || "",
      reg.bairro || "",
      REG_STATUS_LABELS[reg.status] || reg.status,
      new Date(reg.created_at).toLocaleString("pt-BR")
    ]);

    const csvContent = [
      headers.map(escapeCSVField).join(","),
      ...rows.map(row => row.map(escapeCSVField).join(","))
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

  if (loading) return <div className="p-20 text-center text-slate-400 italic font-medium">Carregando inscritos...</div>;

  const attendingCount = registrations.filter(r => r.status === "attended").length;
  const waitingCount = registrations.filter(r => r.status === "waiting").length;

  return (
    <div className="admin-list-page space-y-8 animate-in fade-in duration-500">
      <div className="admin-list-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/agenda")}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <span className="admin-command-eyebrow">Participação pública</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Gestão de Inscrições</h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">{event?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            disabled={registrations.length === 0}
            className="admin-command-cta disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="admin-kpi-card admin-kpi-blue text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inscritos</p>
          <p className="text-3xl font-black text-slate-900">{registrations.length}</p>
        </div>
        <div className="admin-kpi-card admin-kpi-emerald text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmados</p>
          <p className="text-3xl font-black text-emerald-600">{registrations.filter(r => r.status !== 'waiting').length}</p>
        </div>
        <div className="admin-kpi-card admin-kpi-indigo text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Presentes</p>
          <p className="text-3xl font-black text-blue-600">{attendingCount}</p>
        </div>
        <div className="admin-kpi-card admin-kpi-rose text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Em Espera</p>
          <p className="text-3xl font-black text-rose-600">{waitingCount}</p>
        </div>
      </div>

      <div className="admin-table-shell overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Lista de Participantes</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">Ordenado por data de inscrição</span>
        </div>
        
        {registrations.length === 0 ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Nenhuma inscrição realizada até o momento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participante</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bairro</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {registrations.map(reg => (
                  <tr key={reg.id} className={`hover:bg-slate-50/50 transition-colors ${reg.status === 'waiting' ? 'bg-rose-50/20' : ''}`}>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900 leading-none">{reg.name}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-1">{reg.email}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-600">{reg.whatsapp || "--"}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reg.bairro || "--"}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                        reg.status === 'attended' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        reg.status === 'waiting' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {REG_STATUS_LABELS[reg.status] || reg.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => toggleAttendance(reg.id, reg.status)}
                        disabled={reg.status === 'waiting'}
                        className={`p-2 rounded-xl transition-all ${
                          reg.status === 'attended' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                        } disabled:opacity-30`}
                        title={reg.status === 'attended' ? 'Marcar como não presente' : 'Confirmar Presença'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
