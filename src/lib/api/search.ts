import { listReports } from "./content";
import { AcervoItem, BlogPost, Event, getSupabase, isPublishTimeReached, ReportDocument, SearchResultItem, toAppError } from "./core";

export async function searchAcervo(q: string, limit = 10): Promise<AcervoItem[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("acervo_items")
      .select("*")
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as AcervoItem[]).filter((item) => isPublishTimeReached(item.publish_at ?? null));
  } catch (error) {
    throw toAppError("Falha ao buscar no acervo", error);
  }
}

/**
 * Busca posts no blog pelo título ou conteúdo.
 */
export async function searchBlog(q: string, limit = 10): Promise<BlogPost[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .or(`title.ilike.%${q}%,content_md.ilike.%${q}%`)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as BlogPost[]).filter((post) => isPublishTimeReached(post.publish_at ?? null));
  } catch (error) {
    throw toAppError("Falha ao buscar no blog", error);
  }
}

export async function searchReports(q: string, limit = 10): Promise<ReportDocument[]> {
  try {
    return listReports({ q, limit });
  } catch (error) {
    throw toAppError("Falha ao buscar em relatórios", error);
  }
}
/**
 * Busca gastos na transparência por fornecedor, descrição ou categoria.
 */
export async function searchTransparency(q: string, limit = 10): Promise<any[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .or(`vendor.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
      .order("occurred_on", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as any[];
  } catch (error) {
    throw toAppError("Falha ao buscar na transparência", error);
  }
}

/**
 * Busca eventos na agenda por título ou descrição.
 */
export async function searchEvents(q: string, limit = 10): Promise<Event[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order("start_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as Event[];
  } catch (error) {
    throw toAppError("Falha ao buscar eventos", error);
  }
}

// ─────────────────────────────────────────
// Busca Global (FTS)
// ─────────────────────────────────────────

export async function searchAll(q: string, limit = 30): Promise<SearchResultItem[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.rpc("search_all", {
      p_q: q,
      p_limit: limit
    });
    if (error) throw error;
    return (data || []) as SearchResultItem[];
  } catch (error) {
    throw toAppError("Falha ao realizar busca global", error);
  }
}


