import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

const STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "completed", label: "Realizado (Encerrado)" },
  { value: "cancelled", label: "Cancelado" },
];

export function AdminAgendaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recentAssets, setRecentAssets] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [locationName, setLocationName] = useState("");
  const [bairro, setBairro] = useState("");
  const [capacity, setCapacity] = useState<number>(0);
  const [status, setStatus] = useState("draft");
  const [coverAssetId, setCoverAssetId] = useState("");
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    const { data: assets } = await supabase.from("media_assets").select("id, title, public_url, mime_type").order("created_at", { ascending: false }).limit(20);
    setRecentAssets(assets || []);

    if (!isNew) {
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
      if (error) {
        alert("Erro ao carregar evento: " + error.message);
        navigate("/admin/agenda");
        return;
      }
      if (data) {
        setTitle(data.title);
        setDescription(data.description || "");
        setStartAt(data.start_at ? data.start_at.slice(0, 16) : "");
        setEndAt(data.end_at ? data.end_at.slice(0, 16) : "");
        setLocationName(data.location_name || "");
        setBairro(data.bairro || "");
        setCapacity(data.capacity || 0);
        setStatus(data.status);
        setCoverAssetId(data.cover_asset_id || "");
        setRegistrationEnabled(data.registration_enabled);
      }
    }
    setLoading(false);
  }, [id, isNew, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);

    const payload = {
      title,
      description,
      start_at: startAt,
      end_at: endAt || null,
      location_name: locationName,
      bairro,
      capacity: capacity || null,
      status,
      cover_asset_id: coverAssetId || null,
      registration_enabled: registrationEnabled
    };

    try {
      if (isNew) {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").update(payload).eq("id", id);
        if (error) throw error;
      }
      alert("Evento salvo com sucesso!");
      navigate("/admin/agenda");
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 italic">Carregando evento...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isNew ? "Novo Evento" : "Editar Evento"}
          </h1>
          <p className="text-slate-500 mt-1">Organize oficinas, palestras ou atividades de campo.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate("/admin/agenda")}
            className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Evento"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Informações do Evento</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título do Evento</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-bold"
                  placeholder="Ex: Oficina de Saúde Ambiental no Retiro"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl h-32"
                  placeholder="Conte mais sobre o que será feito no evento..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Data/Hora Início</label>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Data/Hora Fim (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Localização</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Local</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Ex: CRAS Retiro / Sede da Associação"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Bairro</label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Ex: Retiro, Volta Redonda"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Status & Vagas</h2>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl font-bold ${
                  status === "published" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200"
                }`}
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Capacidade Total</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">Deixe 0 para vagas ilimitadas.</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <label className="text-sm font-bold text-slate-700">Inscrições Online</label>
              <button
                type="button"
                onClick={() => setRegistrationEnabled(!registrationEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${registrationEnabled ? "bg-emerald-500" : "bg-slate-300"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${registrationEnabled ? "right-1" : "left-1"}`} />
              </button>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Capa do Evento</h2>
            <div className="aspect-video bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative">
              {coverAssetId && recentAssets.find(a => a.id === coverAssetId) ? (
                <img 
                  src={recentAssets.find(a => a.id === coverAssetId).public_url} 
                  alt="Capa" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sem Imagem</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {recentAssets.filter(a => a.mime_type.startsWith("image/")).slice(0, 8).map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setCoverAssetId(asset.id)}
                  className={`aspect-square rounded border-2 transition-all overflow-hidden ${
                    coverAssetId === asset.id ? "border-emerald-500 scale-105" : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
