import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  status: string;
  category: string;
  published_at: string;
  publish_at: string;
  slug: string;
  author_name: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  scheduled: "Agendado",
  archived: "Arquivado",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-blue-100 text-blue-700",
  archived: "bg-rose-100 text-rose-700",
};

export function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  const loadPosts = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    let query = supabase
      .from("blog_posts")
      .select("id, title, status, category, published_at, publish_at, slug, author_name")
      .order("created_at", { ascending: false });

    if (searchTerm) {
      query = query.ilike("title", `%${searchTerm}%`);
    }
    if (filterStatus) {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("[Blog] Erro ao carregar:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm("Tem certeza que deseja excluir esta matéria?")) return;
    
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      loadPosts();
    }
  };

  return (
    <div className="admin-list-page space-y-8 animate-in fade-in duration-500">
      <div className="admin-list-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Redação pública</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Blog & Notícias</h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">Gestão editorial, matérias, notícias e comunicação com a rede SEMEAR.</p>
        </div>
        <Link 
          to="/admin/blog/novo"
          className="admin-command-cta"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Matéria
        </Link>
      </div>

      <div className="admin-filter-bar flex flex-wrap items-end gap-4 p-6">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Busca por título</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Título da matéria..."
            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 font-bold"
          />
        </div>

        <div className="w-48">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => loadPosts()}
          className="p-3 text-slate-400 hover:text-emerald-600 transition-colors"
          title="Recarregar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="admin-table-shell overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Carregando editorias...</div>
        ) : posts.length === 0 ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Nenhuma matéria encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Matérias do blog administrativo com categoria, status e ações.</caption>
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th scope="col" className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Matéria</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900 leading-snug">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">/{post.slug}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">por {post.author_name || "Equipe"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{post.category || "Geral"}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[post.status]}`}>
                        {STATUS_LABELS[post.status]}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/blog/${post.slug}`} 
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Ver no Portal"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                        <button 
                          onClick={() => navigate(`/admin/blog/${post.id}`)}
                          className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
