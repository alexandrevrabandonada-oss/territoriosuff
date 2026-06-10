import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminUploadMedia, validateAdminUploadFile } from "../../lib/admin/media";
import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

const STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "completed", label: "Realizado" },
  { value: "cancelled", label: "Cancelado" },
];

export function AdminAgendaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [assetSearch, setAssetSearch] = useState("");

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
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    setLoading(true);

    const { data: assets } = await supabase.from("media_assets")
      .select("id, title, public_url, mime_type")
      .ilike("title", `%${assetSearch}%`)
      .order("created_at", { ascending: false })
      .limit(12);
    setRecentAssets(assets || []);

    if (!isNew && loading) {
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
  }, [id, isNew, navigate, assetSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      validateAdminUploadFile(file, {
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      });
      const asset = await adminUploadMedia({
        bucket: "media",
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        status: "published",
        altText: `Capa do evento: ${title || file.name}`
      });
      
      setCoverAssetId(asset.id);
      loadData();
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = await getSupabaseClientOrNull();
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

  if (loading) return <div className="p-20 text-center text-slate-400 italic font-medium">Carregando editor...</div>;

  return (
    <form onSubmit={handleSave} className="admin-editor-page space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="admin-editor-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => navigate("/admin/agenda")}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <span className="admin-command-eyebrow">Operação territorial</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              {isNew ? "Novo Evento" : "Editar Evento"}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">Gestão de oficinas, palestras e atividades territoriais.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="submit" 
            disabled={saving}
            className="admin-command-cta disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Evento"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Configuração Básica</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título da Atividade</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-xl"
                  placeholder="Ex: Oficina de Mapeamento Participativo"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição Detalhada</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl h-40 font-medium"
                  placeholder="Objetivos, público-alvo e cronograma resumido..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Início (Data e Hora)</label>
                  <input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    required
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fim (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Localização Territorial</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Local</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="Ex: Sede do CRAS Sul"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bairro / Cidade</label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="Ex: Retiro, Volta Redonda"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Vagas & Inscrições</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status do Evento</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full px-5 py-3 border rounded-xl font-black transition-colors ${
                    status === "published" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100"
                  }`}
                >
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Capacidade Máxima</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value))}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-center"
                />
                <p className="text-[10px] font-bold text-slate-400 mt-2 italic uppercase tracking-tighter">0 = Sem limite de vagas</p>
              </div>

              <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div>
                  <label className="block text-xs font-black text-slate-900 uppercase tracking-widest">Ativar Inscrições</label>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Habilitar form público</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRegistrationEnabled(!registrationEnabled)}
                  className={`w-14 h-8 rounded-full transition-all relative shadow-inner ${registrationEnabled ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${registrationEnabled ? "right-1" : "left-1"}`} />
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Capa</h2>
              <label className={`cursor-pointer px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs border border-emerald-100 hover:bg-emerald-100 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                {isUploading ? "..." : "Upload"}
                <input type="file" className="hidden" accept="image/*" onChange={handleQuickUpload} disabled={isUploading} />
              </label>
            </div>
            
            <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 overflow-hidden relative group">
              {coverAssetId && recentAssets.find(a => a.id === coverAssetId) ? (
                <>
                  <img 
                    src={recentAssets.find(a => a.id === coverAssetId).public_url} 
                    alt="Capa" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => setCoverAssetId("")}
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"
                    >
                      Remover
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                    Selecione abaixo ou suba nova capa
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <input 
                  type="text" 
                  placeholder="Buscar mídias..." 
                  className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold flex-1"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {recentAssets.filter(a => a.mime_type.startsWith("image/")).map(asset => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setCoverAssetId(asset.id)}
                    className={`aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                      coverAssetId === asset.id ? "border-emerald-500 scale-105 shadow-md" : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
