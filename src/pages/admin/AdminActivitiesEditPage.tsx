import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { InstagramEmbed } from "../../components/InstagramEmbed";
import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseInstagramPostUrl(value: string): { permalink: string; shortcode: string; kind: string } | null {
  try {
    const parsed = new URL(value.trim());
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "instagram.com" && hostname !== "www.instagram.com") return null;

    const match = parsed.pathname.match(/\/(p|reel|tv)\/([^/?#]+)/);
    if (!match) return null;

    return {
      permalink: `https://www.instagram.com/${match[1]}/${match[2]}/`,
      shortcode: match[2],
      kind: match[1] === "reel" ? "reel" : "post"
    };
  } catch {
    return null;
  }
}

function formatDateForTitle(value: string): string {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
}

export function AdminActivitiesEditPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const loadItem = useCallback(async () => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase || isNew) return;
    setLoading(true);
    const { data, error } = await supabase.from("conversations").select("*").eq("id", id).single();
    if (error) {
      alert("Erro ao carregar atividade: " + error.message);
      navigate("/admin/atividades");
      return;
    }
    setTitle(data.title || "");
    setSlug(data.slug || "");
    setExcerpt(data.excerpt || "");
    setBodyMd(data.body_md || "");
    setStatus(data.status === "published" ? "published" : "draft");
    setInstagramUrl(data.meta?.instagram_url || "");
    setActivityDate(data.meta?.activity_date || "");
    setLocation(data.meta?.location || "");
    setLoading(false);
  }, [id, isNew, navigate]);

  useEffect(() => {
    void loadItem();
  }, [loadItem]);

  useEffect(() => {
    if (isNew && title) setSlug(slugify(title));
  }, [isNew, title]);

  const handleGenerateArticle = () => {
    const post = parseInstagramPostUrl(instagramUrl);
    if (!post) {
      alert("Informe um link válido de post, reel ou TV do Instagram.");
      return;
    }

    const nextDate = activityDate || new Date().toISOString().slice(0, 10);
    const dateLabel = formatDateForTitle(nextDate);
    const nextTitle = title.trim() || `Registro de atividade SEMEAR${dateLabel ? ` em ${dateLabel}` : ""}`;
    const nextLocation = location.trim() || "território";

    setActivityDate(nextDate);
    setTitle(nextTitle);
    setSlug(slug || slugify(nextTitle));
    setExcerpt(excerpt.trim() || `Matéria produzida a partir de publicação do Instagram sobre atividade do SEMEAR em ${nextLocation}.`);
    setBodyMd(bodyMd.trim() || [
      `Esta matéria registra uma atividade do SEMEAR realizada em ${nextLocation}.`,
      "",
      "O post original no Instagram documenta momentos, participantes e registros visuais da ação. Use este espaço para complementar a publicação com contexto territorial, objetivos da atividade, pessoas envolvidas e principais encaminhamentos.",
      "",
      "## O que aconteceu",
      "",
      "- Contextualize a atividade.",
      "- Descreva quem participou.",
      "- Registre aprendizados, demandas e próximos passos.",
      "",
      `Publicação original: ${post.permalink}`
    ].join("\n"));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    if (!title.trim() || !slug.trim()) {
      alert("Título e slug são obrigatórios.");
      return;
    }
    if (status === "published" && !instagramUrl.trim()) {
      alert("Para publicar uma atividade, informe o link do post do Instagram.");
      return;
    }

    const instagramPost = parseInstagramPostUrl(instagramUrl);

    setSaving(true);
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      body_md: bodyMd.trim() || null,
      status,
      meta: {
        kind: "activity",
        instagram_url: instagramUrl.trim(),
        instagram_shortcode: instagramPost?.shortcode || null,
        instagram_kind: instagramPost?.kind || null,
        activity_date: activityDate || null,
        location: location.trim() || null
      }
    };

    const result = isNew
      ? await supabase.from("conversations").insert(payload).select("id").single()
      : await supabase.from("conversations").update(payload).eq("id", id).select("id").single();

    setSaving(false);
    if (result.error) {
      alert("Erro ao salvar: " + result.error.message);
      return;
    }

    navigate("/admin/atividades");
  };

  if (loading) {
    return <div className="p-20 text-center text-slate-400 italic font-medium">Carregando atividade...</div>;
  }

  return (
    <form className="admin-editor-page space-y-8 animate-in fade-in duration-500" onSubmit={handleSubmit}>
      <div className="admin-editor-hero flex flex-col justify-between gap-4 p-8 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Registro de campo</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            {isNew ? "Nova atividade" : "Editar atividade"}
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">
            Publique um post do Instagram com o relato editorial da atividade.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/atividades" className="admin-command-ghost">Cancelar</Link>
          <button type="submit" disabled={saving} className="admin-command-cta">
            {saving ? "Salvando..." : "Salvar atividade"}
          </button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div>
            <label>Título da atividade</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex: Oficina de escuta no Retiro" />
          </div>
          <div>
            <label>Slug público</label>
            <input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} placeholder="oficina-de-escuta-no-retiro" />
          </div>
          <div>
            <label>Link do post no Instagram</label>
            <div className="flex flex-col gap-3 md:flex-row">
              <input className="flex-1" value={instagramUrl} onChange={(event) => setInstagramUrl(event.target.value)} placeholder="https://www.instagram.com/p/..." type="url" />
              <button
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-emerald-800 transition-colors hover:bg-emerald-100"
                onClick={handleGenerateArticle}
                type="button"
              >
                Transformar em matéria
              </button>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">
              O botão cria um rascunho editorial a partir do link e mantém o post incorporado na matéria pública.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label>Data da atividade</label>
              <input value={activityDate} onChange={(event) => setActivityDate(event.target.value)} type="date" />
            </div>
            <div>
              <label>Local</label>
              <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Bairro, escola, praça..." />
            </div>
          </div>
          <div>
            <label>Resumo</label>
            <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="Resumo curto para o card público." />
          </div>
          <div>
            <label>Texto sobre como foi</label>
            <textarea className="min-h-52" value={bodyMd} onChange={(event) => setBodyMd(event.target.value)} placeholder="Conte como foi a atividade, quem participou e quais encaminhamentos saíram." />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <label>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value as "draft" | "published")}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Publicado aparece no portal em Conversas e atividades. Rascunho fica apenas no admin.
            </p>
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Prévia do Instagram</p>
            </div>
            {instagramUrl ? (
              <InstagramEmbed title={title || "Atividade SEMEAR"} url={instagramUrl} />
            ) : (
              <div className="p-8 text-center text-sm font-medium text-slate-400">
                Cole um link do Instagram para visualizar o embed.
              </div>
            )}
          </section>
        </aside>
      </div>
    </form>
  );
}
