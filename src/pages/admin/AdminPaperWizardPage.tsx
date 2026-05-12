import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

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
    cover_asset_id: "",
    tags: "",
    related_collection_id: "",
    status: "draft"
  });

  useEffect(() => {
    async function loadData() {
      if (!supabase) return;
      const { data: colls } = await supabase.from("acervo_collections").select("id, title").order("title");
      setCollections(colls || []);

      const { data: assets } = await supabase.from("media_assets").select("id, title, public_url, mime_type").order("created_at", { ascending: false }).limit(20);
      setRecentAssets(assets || []);
    }
    loadData();
  }, []);

  // Validation: Duplicate DOI or Title
  const checkDuplicates = useCallback(async (field: "doi" | "title", value: string) => {
    if (!supabase || !value || value.length < 5) return;
    
    let query = supabase.from("acervo_items").select("id, title").limit(1);
    if (field === "doi") {
      query = query.eq("doi", value);
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

  const handleSubmit = async (finalStatus: "draft" | "published") => {
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
              <h2 className="text-xl font-bold text-slate-900">1. Identificação do Artigo</h2>
              <p className="text-sm text-slate-500">Comece pelos dados básicos de identificação.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título Completo</label>
                <textarea
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({...formData, title: e.target.value});
                    if (e.target.value.length > 10) checkDuplicates("title", e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 h-24"
                  placeholder="Ex: Análise da qualidade do ar em Volta Redonda..."
                />
                {duplicateWarning && <p className="text-xs text-rose-500 mt-2 font-bold">{duplicateWarning}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Resumo / Abstract</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 h-32"
                  placeholder="Breve resumo do estudo..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Autores (separados por ponto e vírgula)</label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData({...formData, authors: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
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
              <h2 className="text-xl font-bold text-slate-900">2. Fonte Científica</h2>
              <p className="text-sm text-slate-500">Detalhes sobre onde e quando foi publicado.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Periódico / Instituição / Evento</label>
                <input
                  type="text"
                  value={formData.source_name}
                  onChange={(e) => setFormData({...formData, source_name: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl"
                  placeholder="Ex: Revista Brasileira de Saúde Ambiental"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ano de Publicação</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nível de Relevância</label>
                <select
                  value={formData.relevance_level}
                  onChange={(e) => setFormData({...formData, relevance_level: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl"
                >
                  {RELEVANCE_LEVELS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">DOI (Digital Object Identifier)</label>
                <input
                  type="text"
                  value={formData.doi}
                  onChange={(e) => {
                    setFormData({...formData, doi: e.target.value});
                    checkDuplicates("doi", e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-sm"
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
              <h2 className="text-xl font-bold text-slate-900">3. Arquivo e Link</h2>
              <p className="text-sm text-slate-500">Como os usuários acessarão o conteúdo.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vincular PDF do Acervo</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {recentAssets.filter(a => a.mime_type === "application/pdf").map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setFormData({...formData, cover_asset_id: asset.id})}
                      className={`p-3 border rounded-xl text-center transition-all ${
                        formData.cover_asset_id === asset.id ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" : "bg-white border-slate-100 text-slate-500 hover:border-emerald-200"
                      }`}
                    >
                      <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-bold block truncate">{asset.title}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">Dica: Faça o upload do PDF na aba de Uploads antes de cadastrar o artigo.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Link Externo (se não houver DOI)</label>
                <input
                  type="url"
                  value={formData.source_url}
                  onChange={(e) => setFormData({...formData, source_url: e.target.value})}
                  disabled={!!formData.doi}
                  className={`w-full px-4 py-3 border rounded-xl ${formData.doi ? "bg-slate-50 text-slate-400" : "bg-white border-slate-200"}`}
                  placeholder="https://..."
                />
                {formData.doi && <p className="text-[10px] text-emerald-600 mt-1">O link será gerado automaticamente via DOI.</p>}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">4. Categorização</h2>
              <p className="text-sm text-slate-500">Ajude as pessoas a encontrarem este artigo.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Dossiê / Coleção Relacionada</label>
                <select
                  value={formData.related_collection_id}
                  onChange={(e) => setFormData({...formData, related_collection_id: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl"
                >
                  <option value="">Nenhum</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Palavras-chave (Tags separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl"
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
              <h2 className="text-xl font-bold text-slate-900">5. Revisar e Publicar</h2>
              <p className="text-sm text-slate-500">Confira se está tudo certo antes de salvar.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Título</p>
                <p className="text-sm font-bold text-slate-900">{formData.title || "(Vazio)"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fonte</p>
                  <p className="text-sm text-slate-700">{formData.source_name || "(Vazia)"} ({formData.year})</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">DOI</p>
                  <p className="text-sm text-slate-700 font-mono">{formData.doi || "--"}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Relevância</p>
                <p className="text-sm text-slate-700 capitalize">{formData.relevance_level}</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-xs text-emerald-800">
                Ao clicar em **Publicar Agora**, o artigo ficará imediatamente disponível no portal público do Acervo.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/admin/acervo")}
          className="text-slate-400 hover:text-slate-600 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-bold">Voltar ao Acervo</span>
        </button>
        <div className="flex items-center gap-2">
          {[1,2,3,4,5].map(i => (
            <div 
              key={i} 
              className={`w-8 h-1 rounded-full transition-all ${step >= i ? "bg-emerald-500" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 md:p-12">
          {renderStep()}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={step === 1 || loading}
            className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-all disabled:opacity-0"
          >
            Anterior
          </button>
          
          <div className="flex items-center gap-3">
            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !formData.title}
                className="px-10 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                Continuar
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  className="px-6 py-3 text-emerald-600 font-bold hover:bg-emerald-50 rounded-xl transition-all"
                >
                  Salvar Rascunho
                </button>
                <button
                  onClick={() => handleSubmit("published")}
                  disabled={loading}
                  className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                >
                  {loading ? "Salvando..." : "Publicar Agora"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
