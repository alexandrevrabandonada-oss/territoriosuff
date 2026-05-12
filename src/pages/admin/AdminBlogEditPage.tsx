import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

const CATEGORIES = [
  "Notícias",
  "Saúde Ambiental",
  "Eventos",
  "Monitoramento",
  "Comunidade",
  "Institucional",
];

const STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "scheduled", label: "Agendado" },
  { value: "archived", label: "Arquivado" },
];

export function AdminBlogEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [category, setCategory] = useState("Notícias");
  const [status, setStatus] = useState("draft");
  const [authorName, setAuthorName] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [tags, setTags] = useState("");
  const [coverAssetId, setCoverAssetId] = useState("");

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    const { data: assets } = await supabase.from("media_assets").select("id, title, public_url, mime_type, alt_text").order("created_at", { ascending: false }).limit(20);
    setRecentAssets(assets || []);

    if (!isNew) {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
      if (error) {
        alert("Erro ao carregar matéria: " + error.message);
        navigate("/admin/blog");
        return;
      }
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setSummary(data.summary || "");
        setContentMd(data.content_md || "");
        setCategory(data.category || "Notícias");
        setStatus(data.status);
        setAuthorName(data.author_name || "");
        setPublishAt(data.publish_at || "");
        setTags(data.tags?.join(", ") || "");
        setCoverAssetId(data.cover_asset_id || "");
      }
    }
    setLoading(false);
  }, [id, isNew, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Slug Auto-gen
  useEffect(() => {
    if (isNew && title) {
      const generated = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  }, [title, isNew]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    // Alertas de validação
    if (status === "published" && !summary.trim()) {
      alert("Aviso: O resumo é obrigatório para publicação.");
      return;
    }
    if (status === "published" && !coverAssetId) {
      alert("Aviso: Uma imagem de capa é recomendada para publicação.");
    }

    const selectedAsset = recentAssets.find(a => a.id === coverAssetId);
    if (status === "published" && selectedAsset && !selectedAsset.alt_text) {
      alert("Aviso de Acessibilidade: A imagem de capa selecionada não possui texto alternativo. Considere adicionar um no banco de mídias.");
    }

    setSaving(true);
    const payload = {
      title,
      slug,
      summary,
      content_md: contentMd,
      category,
      status,
      author_name: authorName,
      publish_at: publishAt || null,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      cover_asset_id: coverAssetId || null,
      published_at: status === "published" ? new Date().toISOString() : null
    };

    try {
      if (isNew) {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
        if (error) throw error;
      }
      alert("Matéria salva com sucesso!");
      navigate("/admin/blog");
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 italic">Carregando editor...</div>;

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isNew ? "Nova Matéria" : "Editar Matéria"}
          </h1>
          <p className="text-slate-500 mt-1">Crie conteúdos envolventes para a comunidade SEMEAR.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate("/admin/blog")}
            className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Matéria"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Conteúdo Editorial</h2>
              <button 
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                  showPreview ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {showPreview ? "Ocultar Preview" : "Ver Preview"}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título da Matéria</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-bold focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Ex: Novo Posto de Monitoramento em Volta Redonda"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Resumo (Summary)</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl h-24"
                  placeholder="Introdução rápida que aparece nos cards de listagem..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className={showPreview ? "block" : "col-span-2"}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Conteúdo (Markdown)</label>
                  <textarea
                    value={contentMd}
                    onChange={(e) => setContentMd(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm h-[500px]"
                    placeholder="Escreva aqui sua matéria..."
                  />
                </div>
                {showPreview && (
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-[500px] overflow-y-auto prose prose-slate prose-sm max-w-none">
                    <h1 className="mt-0">{title || "Título do Post"}</h1>
                    <div dangerouslySetInnerHTML={{ __html: contentMd.replace(/\n/g, "<br/>") }} />
                    <p className="text-slate-400 italic text-[10px] mt-8">(Preview básico de texto)</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Configurações</h2>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Autor (Exibido)</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Ex: Dr. Fulano de Tal"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status Editorial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl font-bold transition-colors ${
                  status === "published" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {status === "scheduled" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Agendar para</label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
              />
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Capa da Matéria</h2>
            <div className="aspect-video bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative group">
              {coverAssetId && recentAssets.find(a => a.id === coverAssetId) ? (
                <img 
                  src={recentAssets.find(a => a.id === coverAssetId).public_url} 
                  alt="Capa" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhuma Capa Selecionada</p>
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
