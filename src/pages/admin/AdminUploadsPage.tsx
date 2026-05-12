import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase/client";

interface MediaAsset {
  id: string;
  bucket: string;
  path: string;
  public_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  title: string;
  status: string;
  created_at: string;
}

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const BUCKETS = [
  { id: "media", label: "Mídia Geral" },
  { id: "acervo", label: "Acervo" },
  { id: "blog", label: "Blog" },
  { id: "reports", label: "Relatórios" },
  { id: "transparency", label: "Transparência" },
];

export function AdminUploadsPage() {
  const [recentAssets, setRecentAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [credit, setCredit] = useState("");
  const [tags, setTags] = useState("");
  const [bucket, setBucket] = useState("media");
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
      setTitle(selectedFile.name);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !supabase) return;

    // Validação de alt_text para imagens se for publicar
    if (status === "published" && file.type.startsWith("image/") && !altText.trim()) {
      setError("Texto alternativo é obrigatório para imagens publicadas.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // 1. Upload para o Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: storageError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) throw storageError;
      setUploadProgress(60);

      // 2. Gerar URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // 3. Salvar Metadados no Banco
      const { error: dbError } = await supabase.from("media_assets").insert({
        bucket,
        path: filePath,
        public_url: publicUrl,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        title,
        description,
        alt_text: altText,
        credit,
        status,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        created_by: userId
      });

      if (dbError) throw dbError;

      setUploadProgress(100);
      
      // Reset Form
      setFile(null);
      setTitle("");
      setDescription("");
      setAltText("");
      setCredit("");
      setTags("");
      
      await loadRecentAssets();
      alert("Upload realizado com sucesso!");
    } catch (err: any) {
      console.error("[Upload] Falha:", err);
      setError(err.message || "Falha no upload.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Upload de Mídia</h1>
        <p className="text-slate-500 mt-1">Envie arquivos para o acervo, blog ou relatórios do SEMEAR.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpload} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {/* Dropzone Placeholder */}
            <div 
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center ${
                file ? "border-emerald-200 bg-emerald-50" : "border-slate-200 hover:border-emerald-400 bg-slate-50"
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
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">Clique para selecionar ou arraste o arquivo</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG ou WEBP (Max 15MB)</p>
                </>
              ) : (
                <div className="flex items-center gap-4 text-left">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm overflow-hidden border border-emerald-100">
                    {file.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="text-xs text-rose-500 font-bold mt-1 hover:underline"
                    >
                      Remover arquivo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Título do Arquivo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Ex: Relatório de Monitoramento Abr/2026"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Destino (Bucket)</label>
                <select
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20"
                >
                  {BUCKETS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20 h-20"
                  placeholder="Breve resumo sobre o arquivo..."
                />
              </div>

              {file?.type.startsWith("image/") && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Texto Alternativo (Acessibilidade) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg border-rose-200 focus:ring-2 focus:ring-rose-500/10"
                    placeholder="Descreva o que aparece na imagem..."
                    required={status === "published"}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Crédito / Fonte</label>
                <input
                  type="text"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Ex: Foto por João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="saude, uff, 2026"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100">
                {error}
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-slate-500">Enviando... {uploadProgress}%</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !file}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Enviando arquivo..." : "Salvar e Iniciar Upload"}
            </button>
          </form>
        </div>

        {/* Recent Uploads */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Uploads Recentes</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Carregando lista...</div>
            ) : recentAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic">Nenhum upload recente.</div>
            ) : (
              recentAssets.map((asset) => (
                <div key={asset.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                    {asset.mime_type.startsWith("image/") ? (
                      <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{asset.title}</p>
                    <p className="text-xs text-slate-500 truncate">{asset.bucket} / {asset.file_name}</p>
                  </div>
                  <a 
                    href={asset.public_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Ver arquivo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => loadRecentAssets()}
            className="w-full py-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            Atualizar lista
          </button>
        </div>
      </div>
    </div>
  );
}
