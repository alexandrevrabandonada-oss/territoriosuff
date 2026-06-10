import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminUploadMedia, validateAdminUploadFile } from "../../lib/admin/media";
import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

const RELEVANCE_LEVELS = [
  { value: "referencia central", label: "Referência Central" },
  { value: "complementar", label: "Complementar" },
  { value: "historico", label: "Histórico" },
  { value: "tecnico", label: "Técnico" },
];

export function AdminPaperWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    authors: "",
    source_name: "",
    year: new Date().getFullYear(),
    doi: "",
    source_url: "",
    relevance_level: "complementar",
    cover_asset_id: "", // Usado para o PDF no wizard de artigos
    tags: "",
    related_collection_id: "",
    status: "draft"
  });

  const loadData = useCallback(async () => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    const { data: colls } = await supabase.from("acervo_collections").select("id, title").order("title");
    setCollections(colls || []);

    const { data: assets } = await supabase.from("media_assets")
      .select("id, title, public_url, mime_type")
      .order("created_at", { ascending: false })
      .limit(20);
    setRecentAssets(assets || []);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Validation: Duplicate DOI or Title
  const checkDuplicates = useCallback(async (field: "doi" | "title", value: string) => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase || !value || value.length < 5) return;
    
    let query = supabase.from("acervo_items").select("id, title").limit(1);
    if (field === "doi") {
      query = query.eq("source_url", `https://doi.org/${value.replace(/^https?:\/\/doi\.org\//, "")}`);
    } else {
      query = query.ilike("title", `%${value}%`);
    }

    const { data } = await query;
    if (data && data.length > 0) {
      setDuplicateWarning(`Atenção: Já existe um item com ${field === "doi" ? "este DOI" : "título parecido"}: "${data[0].title}"`);
    } else {
      setDuplicateWarning(null);
    }
  }, []);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      validateAdminUploadFile(file, {
        allowedMimeTypes: ["application/pdf"],
      });
      const asset = await adminUploadMedia({
        bucket: "acervo",
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        status: "published",
        altText: `PDF de Artigo: ${formData.title || file.name}`
      });
      
      setFormData({ ...formData, cover_asset_id: asset.id });
      await loadData();
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (finalStatus: "draft" | "published") => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    setLoading(true);

    const slug = formData.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const payload = {
      ...formData,
      type: "artigo_cientifico",
      slug,
      status: finalStatus,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      published_at: formData.year ? `${formData.year}-01-01` : null,
      source_url: formData.doi ? `https://doi.org/${formData.doi.replace(/^https?:\/\/doi\.org\//, "")}` : formData.source_url
    };

    const { error } = await supabase.from("acervo_items").insert(payload);

    if (error) {
      alert("Erro ao salvar: " + error.message);
      setLoading(false);
    } else {
      alert("Artigo cadastrado com sucesso!");
      navigate("/admin/acervo");
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">1. Identificação do Artigo</h2>
              <p className="text-sm font-medium text-slate-500">Comece pelos dados básicos de identificação do estudo.</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título Completo</label>
                <textarea
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({...formData, title: e.target.value});
                    if (e.target.value.length > 10) checkDuplicates("title", e.target.value);
                  }}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-lg h-28"
                  placeholder="Ex: Análise da qualidade do ar e internações em Volta Redonda..."
                />
                {duplicateWarning && <p className="text-xs text-rose-500 mt-2 font-bold bg-rose-50 p-2 rounded-lg">⚠️ {duplicateWarning}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resumo / Abstract</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 h-40 font-medium"
                  placeholder="Breve resumo das conclusões principais..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Autores (separados por ponto e vírgula)</label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData({...formData, authors: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                  placeholder="Ex: Silva, J. A.; Oliveira, M. R."
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">2. Fonte Científica</h2>
              <p className="text-sm font-medium text-slate-500">Onde e quando o trabalho foi publicado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Periódico / Instituição / Evento</label>
                <input
                  type="text"
                  value={formData.source_name}
                  onChange={(e) => setFormData({...formData, source_name: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                  placeholder="Ex: Revista Brasileira de Saúde Ambiental"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ano de Publicação</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Importância do Item</label>
                <select
                  value={formData.relevance_level}
                  onChange={(e) => setFormData({...formData, relevance_level: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                >
                  {RELEVANCE_LEVELS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">DOI (Identificador Digital)</label>
                <input
                  type="text"
                  value={formData.doi}
                  onChange={(e) => {
                    setFormData({...formData, doi: e.target.value});
                    if (e.target.value.length > 5) checkDuplicates("doi", e.target.value);
                  }}
                  className="w-full px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-2xl font-mono text-sm font-bold text-emerald-800"
                  placeholder="Ex: 10.1016/j.envres.2024.118221"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">3. Arquivo PDF</h2>
              <p className="text-sm font-medium text-slate-500">Vincule ou suba o arquivo do artigo completo.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Selecionar do Acervo</label>
                <label className={`cursor-pointer px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs border border-emerald-100 hover:bg-emerald-100 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                  {isUploading ? "Enviando..." : "+ Subir Novo PDF"}
                  <input type="file" className="hidden" accept=".pdf" onChange={handleQuickUpload} disabled={isUploading} />
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentAssets.filter(a => a.mime_type === "application/pdf").map(asset => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setFormData({...formData, cover_asset_id: asset.id})}
                    className={`p-4 border-2 rounded-2xl text-center transition-all ${
                      formData.cover_asset_id === asset.id ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md scale-105" : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200"
                    }`}
                  >
                    <svg className={`w-10 h-10 mx-auto mb-2 ${formData.cover_asset_id === asset.id ? 'text-emerald-500' : 'text-slate-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest block truncate">{asset.title}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link Alternativo (se não houver PDF/DOI)</label>
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData({...formData, source_url: e.target.value})}
                  disabled={!!formData.doi}
                  className={`w-full px-5 py-4 border rounded-2xl font-bold ${formData.doi ? "bg-slate-50 text-slate-400 border-slate-100" : "bg-white border-slate-200"}`}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">4. Curadoria</h2>
              <p className="text-sm font-medium text-slate-500">Categorização para busca e organização em dossiês.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Dossiê / Coleção Relacionada</label>
                <select
                  value={formData.related_collection_id}
                  onChange={(e) => setFormData({...formData, related_collection_id: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                >
                  <option value="">Nenhuma Coleção</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tags / Palavras-chave (vírgulas)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                  placeholder="Ex: poluição, uff, volta redonda"
                />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">5. Revisão Final</h2>
              <p className="text-sm font-medium text-slate-500">Confira os dados principais antes de salvar no sistema.</p>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6 shadow-2xl">
              <div>
                <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest mb-2">Título do Artigo</p>
                <p className="text-lg font-bold leading-tight">{formData.title || "(Não informado)"}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div>
                  <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest mb-2">Fonte & Ano</p>
                  <p className="text-sm font-bold">{formData.source_name || "---"} ({formData.year})</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest mb-2">DOI</p>
                  <p className="text-sm font-mono">{formData.doi || "---"}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest mb-2">PDF Vinculado</p>
                  <p className="text-sm font-bold flex items-center gap-2">
                    {formData.cover_asset_id ? (
                      <><span className="text-emerald-500">●</span> Sim (ID: {formData.cover_asset_id.slice(0,8)})</>
                    ) : (
                      <><span className="text-rose-500">●</span> Não vinculado</>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black text-emerald-400 tracking-widest mb-2">Importância</p>
                  <p className="text-sm font-bold capitalize">{formData.relevance_level}</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                Ao publicar, o artigo será indexado automaticamente no Acervo público e ficará visível para toda a rede SEMEAR.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-wizard-page mx-auto max-w-5xl space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="admin-editor-hero flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <button 
          onClick={() => navigate("/admin/acervo")}
          className="group flex items-center gap-2 font-bold text-white/75 transition-all hover:text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors group-hover:bg-white/15">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="text-sm">Voltar ao Acervo</span>
        </button>
        
        <div className="relative z-10">
          <span className="admin-command-eyebrow">Wizard científico</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Novo Artigo</h1>
          <p className="mt-3 max-w-xl text-base font-medium text-slate-300">Fluxo guiado para cadastrar papers, estudos e referências acadêmicas no Acervo.</p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          {[1,2,3,4,5].map(i => (
            <div 
              key={i} 
              className={`flex items-center justify-center rounded-full transition-all duration-500 font-black text-xs ${
                step === i ? "w-10 h-10 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : 
                step > i ? "w-8 h-8 bg-emerald-100 text-emerald-600" : 
                "w-8 h-8 bg-slate-100 text-slate-300"
              }`}
            >
              {step > i ? "✓" : i}
            </div>
          ))}
        </div>
      </div>

      <div className="admin-wizard-card overflow-hidden">
        <div className="p-8 md:p-16">
          {renderStep()}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 p-8">
          <button
            onClick={handlePrev}
            disabled={step === 1 || loading}
            className="px-8 py-3 text-slate-500 font-black hover:bg-slate-200 rounded-2xl transition-all disabled:opacity-0 uppercase tracking-widest text-xs"
          >
            Anterior
          </button>
          
          <div className="flex items-center gap-4">
            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !formData.title}
                className="px-12 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
              >
                Próxima Etapa
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  className="px-6 py-4 text-emerald-600 font-black hover:bg-emerald-100 rounded-2xl transition-all uppercase tracking-widest text-xs"
                >
                  Salvar Rascunho
                </button>
                <button
                  onClick={() => handleSubmit("published")}
                  disabled={loading}
                  className="px-14 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-2xl shadow-emerald-600/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                  {loading ? "Sincronizando..." : "Publicar Artigo"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
