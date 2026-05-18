import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import { adminUploadMedia, formatAssetSize, isImageAsset, type MediaAssetRecord } from "../../lib/admin/media";

const ACERVO_EDITORIAL_TYPES = [
  {
    value: "artigo_cientifico",
    label: "Artigo científico",
    description: "Para papers, PDFs acadêmicos, estudos e pesquisas.",
  },
  {
    value: "noticia",
    label: "Notícia ou matéria",
    description: "Para reportagens, matérias históricas e clipping jornalístico.",
  },
  {
    value: "midia",
    label: "Mídia",
    description: "Para fotos, vídeos, imagens e registros audiovisuais.",
  },
  {
    value: "documento",
    label: "Documento histórico",
    description: "Para atas, documentos escaneados e registros públicos antigos.",
  },
  {
    value: "relatorio_tecnico",
    label: "Relatório técnico",
    description: "Para notas técnicas, boletins, medições e documentos oficiais.",
  },
  {
    value: "outro",
    label: "Outro",
    description: "Para conteúdos do Acervo que não se encaixam nas categorias acima.",
  },
] as const;

const ACERVO_ACTIONS = [
  { type: "artigo_cientifico", label: "Criar item de Acervo como Artigo Científico", emoji: "📄" },
  { type: "noticia", label: "Criar item de Acervo como Notícia", emoji: "📰" },
  { type: "midia", label: "Criar item de Acervo como Mídia", emoji: "🎬" },
  { type: "documento", label: "Criar item de Acervo como Documento", emoji: "🏛️" },
];

function buildAcervoLink(assetId: string, type: string) {
  return `/admin/acervo/novo?assetId=${assetId}&type=${type}`;
}

function getAcervoTypeLabel(type: string | null | undefined) {
  return ACERVO_EDITORIAL_TYPES.find((option) => option.value === type)?.label ?? "Outro";
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const BUCKETS = [
  { id: "acervo", label: "Acervo" },
  { id: "media", label: "Mídia Geral (fora do Acervo)" },
  { id: "blog", label: "Blog" },
  { id: "reports", label: "Relatórios" },
  { id: "transparency", label: "Transparência" },
];

export function AdminUploadsPage() {
  const [recentAssets, setRecentAssets] = useState<MediaAssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successAsset, setSuccessAsset] = useState<MediaAssetRecord | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [credit, setCredit] = useState("");
  const [source, setSource] = useState("");
  const [tags, setTags] = useState("");
  const [bucket, setBucket] = useState("acervo");
  const [acervoContentType, setAcervoContentType] = useState("artigo_cientifico");
  const [status, setStatus] = useState("draft");

  const loadRecentAssets = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error("[Uploads] Erro ao carregar:", fetchError);
    } else {
      setRecentAssets(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecentAssets();
  }, [loadRecentAssets]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
        setError("Tipo de arquivo não permitido. Use PDF, JPG, PNG ou WEBP.");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("Arquivo muito grande. Limite de 15MB.");
        return;
      }
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, "")); // Nome sem extensão como título inicial
      setError(null);
      setSuccessAsset(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("URL copiada!");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Validação de alt_text para imagens se for publicar
    if (status === "published" && file.type.startsWith("image/") && !altText.trim()) {
      setError("Texto alternativo é obrigatório para imagens publicadas.");
      return;
    }
    if (bucket === "acervo" && !acervoContentType) {
      setError("Selecione o tipo editorial do Acervo antes de enviar.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setError(null);

    try {
      const asset = await adminUploadMedia({
        bucket,
        file,
        title,
        description,
        altText,
        credit,
        source,
        acervoContentType: bucket === "acervo" ? acervoContentType : undefined,
        contentCategory: bucket === "acervo" ? "acervo" : bucket,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        status: status as any
      });

      setUploadProgress(100);
      setSuccessAsset(asset);
      
      // Reset Form
      setFile(null);
      setTitle("");
      setDescription("");
      setAltText("");
      setCredit("");
      setSource("");
      setTags("");
      setAcervoContentType("artigo_cientifico");
      
      await loadRecentAssets();
    } catch (err: any) {
      console.error("[Upload] Falha:", err);
      setError(err.message || "Falha no upload.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestão de Mídia</h1>
          <p className="text-slate-500 mt-1">Envie e gerencie arquivos do ecossistema SEMEAR.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpload} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-10 transition-all flex flex-col items-center justify-center text-center ${
                file ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-emerald-400 bg-slate-50/50"
              }`}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,image/*"
                disabled={isUploading}
              />
              
              {!file ? (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm mb-4 border border-slate-100">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-base font-bold text-slate-900">Clique ou arraste o arquivo aqui</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">PDF, JPG, PNG ou WEBP • Máx 15MB</p>
                </>
              ) : (
                <div className="flex items-center gap-6 text-left w-full">
                  <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-md overflow-hidden border-2 border-white">
                    {file.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase mt-1">PDF</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-black text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split("/")[1]}</p>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="text-xs text-rose-500 font-black mt-2 hover:bg-rose-50 px-3 py-1 rounded-full transition-colors border border-rose-100"
                    >
                      Remover e Escolher Outro
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título do Arquivo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold"
                  placeholder="Ex: Foto do Mutirão de Saúde"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Destino (Bucket)</label>
                <select
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 font-bold"
                >
                  {BUCKETS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>

              {bucket === "acervo" && (
                <div className="md:col-span-2 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/50 p-5">
                  <div className="mb-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Tipo de conteúdo no Acervo</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">Esta escolha define onde o item será exibido no portal: artigos, notícias/matérias, mídias ou documentos.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {ACERVO_EDITORIAL_TYPES.map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${acervoContentType === option.value ? "border-emerald-500 bg-white shadow-sm" : "border-emerald-100 bg-white/70 hover:border-emerald-300"}`}
                      >
                        <input
                          type="radio"
                          name="acervo-content-type"
                          value={option.value}
                          checked={acervoContentType === option.value}
                          onChange={(e) => setAcervoContentType(e.target.value)}
                          className="sr-only"
                        />
                        <span className="block text-sm font-black text-slate-900">{option.label}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">{option.description}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status Inicial</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full px-5 py-3 border rounded-xl font-bold transition-colors ${status === 'published' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100'}`}
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição Curta</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 h-24 font-medium"
                  placeholder="Para que serve este arquivo?"
                />
              </div>

              {file?.type.startsWith("image/") && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-rose-400 uppercase tracking-widest mb-2">
                    Texto Alternativo (Acessibilidade) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full px-5 py-3 bg-rose-50/30 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-500/10 font-medium"
                    placeholder="O que está acontecendo nesta imagem?"
                    required={status === "published"}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Créditos</label>
                <input
                  type="text"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium"
                  placeholder="Nome do autor ou fonte"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium"
                  placeholder="saude, volta-redonda, pdf"
                />
              </div>
            </div>

            {error && (
              <div className="p-5 bg-rose-50 text-rose-700 text-sm font-bold rounded-2xl border border-rose-100 flex items-center gap-3">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}

            {successAsset && (
              <div className="p-8 bg-emerald-50 text-emerald-900 rounded-[2rem] border border-emerald-100 shadow-lg shadow-emerald-500/10 flex flex-col gap-6 animate-in zoom-in duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
                    ✅
                  </div>
                  <div>
                    <p className="text-lg font-black leading-tight">Upload concluído!</p>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">O arquivo está pronto para uso.</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-emerald-100 bg-white/90 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="h-28 w-full overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 sm:h-24 sm:w-24 sm:flex-shrink-0">
                      {isImageAsset(successAsset) ? (
                        <img src={successAsset.public_url} alt={successAsset.alt_text || successAsset.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-emerald-700">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="mt-2 text-[10px] font-black uppercase tracking-[0.22em]">PDF</span>
                        </div>
                      )}
                    </div>

                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Nome do arquivo</p>
                        <p className="mt-1 text-sm font-black text-slate-900 break-all">{successAsset.file_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Tipo</p>
                        <p className="mt-1 text-sm font-black text-slate-900">{successAsset.mime_type}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Tamanho</p>
                        <p className="mt-1 text-sm font-black text-slate-900">{formatAssetSize(successAsset.size_bytes)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Categoria editorial</p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {successAsset.bucket === "acervo" ? getAcervoTypeLabel(successAsset.acervo_content_type) : "Não se aplica"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Título interno</p>
                        <p className="mt-1 text-sm font-black text-slate-900">{successAsset.title}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <a 
                    href={successAsset.public_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 py-3 bg-white border border-emerald-200 text-[10px] font-black text-emerald-700 uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all text-center"
                  >
                    Abrir arquivo
                  </a>
                  <button 
                    onClick={() => copyToClipboard(successAsset.public_url)}
                    className="flex-1 py-3 bg-white border border-emerald-200 text-[10px] font-black text-emerald-700 uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all"
                  >
                    Copiar URL
                  </button>
                </div>

                {successAsset.bucket === "acervo" ? (
                  <div className="space-y-4">
                    <Link
                      to={buildAcervoLink(successAsset.id, successAsset.acervo_content_type || acervoContentType)}
                      className="flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-4 text-center text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700"
                    >
                      Criar item no Acervo
                    </Link>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {ACERVO_ACTIONS.map((action) => (
                        <Link
                          key={action.type}
                          to={buildAcervoLink(successAsset.id, action.type)}
                          className="flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-4 text-center transition-all hover:shadow-md"
                        >
                          <span className="mb-2 text-2xl">{action.emoji}</span>
                          <span className="text-[10px] font-black uppercase text-emerald-700">{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link to={buildAcervoLink(successAsset.id, "outro")} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-all group">
                      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📚</span>
                      <span className="text-[10px] font-black uppercase text-emerald-700">Usar no Acervo</span>
                    </Link>
                    <Link to={`/admin/relatorios/novo?assetId=${successAsset.id}`} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-all group">
                      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📄</span>
                      <span className="text-[10px] font-black uppercase text-emerald-700">Usar em Relatório</span>
                    </Link>
                    <Link to={`/admin/blog/novo?assetId=${successAsset.id}`} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-all group">
                      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">✍️</span>
                      <span className="text-[10px] font-black uppercase text-emerald-700">Usar no Blog</span>
                    </Link>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-emerald-100">
                  <button onClick={() => setSuccessAsset(null)} className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 transition-colors">
                    Fazer outro Upload
                  </button>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Metadados... {uploadProgress}%</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !file}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              {isUploading ? "Enviando para o Servidor..." : "Iniciar Upload"}
            </button>
          </form>
        </div>

        {/* Recent Uploads Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Últimos Envios</h2>
            <button 
              onClick={() => loadRecentAssets()}
              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center text-slate-400 italic font-medium">Carregando mídias...</div>
            ) : recentAssets.length === 0 ? (
              <div className="py-20 text-center text-slate-400 italic bg-white rounded-3xl border border-slate-100">Sem uploads ainda.</div>
            ) : (
              recentAssets.map((asset) => (
                <div key={asset.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden border border-slate-100 relative shadow-inner">
                      {isImageAsset(asset) ? (
                        <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <svg className="w-7 h-7 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[8px] font-black uppercase">PDF</span>
                        </div>
                      )}
                      <div className={`absolute bottom-1 right-1 w-3 h-3 border-2 border-white rounded-full ${asset.status === 'published' ? 'bg-emerald-500' : 'bg-amber-400'}`} title={asset.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{asset.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {asset.mime_type.split("/")[1]} • {formatAssetSize(asset.size_bytes)}
                      </p>
                      {asset.bucket === "acervo" && asset.acervo_content_type && (
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                          {getAcervoTypeLabel(asset.acervo_content_type)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button 
                      onClick={() => copyToClipboard(asset.public_url)}
                      className="py-2 bg-slate-50 hover:bg-slate-100 text-[9px] font-black text-slate-600 uppercase tracking-widest rounded-lg transition-all"
                    >
                      Copiar URL
                    </button>
                    <a 
                      href={asset.public_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="py-2 bg-slate-50 hover:bg-emerald-50 text-[9px] font-black text-slate-600 uppercase tracking-widest rounded-lg transition-all text-center"
                    >
                      Abrir
                    </a>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-1">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Usar em:</p>
                    <div className="flex items-center gap-1">
                      <Link to={buildAcervoLink(asset.id, asset.acervo_content_type || "outro")} className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all" title="Acervo">
                        📚
                      </Link>
                      <Link to={`/admin/relatorios/novo?assetId=${asset.id}`} className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all" title="Relatório">
                        📄
                      </Link>
                      <Link to={`/admin/blog/novo?assetId=${asset.id}`} className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all" title="Blog">
                        ✍️
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
