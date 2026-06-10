import { getSupabase, type Expense, type TransparencyLink, type TransparencySummary, toAppError } from "./core";

export type { Expense, TransparencyLink, TransparencySummary } from "./core";

export async function listTransparencyLinks(): Promise<TransparencyLink[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("transparency_links")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as TransparencyLink[];
  } catch (error) {
    throw toAppError("Falha ao listar links de transparência", error);
  }
}

export async function listExpenses(limit = 100): Promise<Expense[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("occurred_on", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Expense[];
  } catch (error) {
    throw toAppError("Falha ao listar despesas", error);
  }
}

export async function getTransparencySummary(): Promise<TransparencySummary> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("category, amount_cents");
    if (error) throw error;

    const summary: TransparencySummary = {
      total_cents: 0,
      by_category: {},
      count: (data ?? []).length
    };

    (data ?? []).forEach((row) => {
      const amount = Number(row.amount_cents);
      const cat = String(row.category);
      summary.total_cents += amount;
      summary.by_category[cat] = (summary.by_category[cat] ?? 0) + amount;
    });

    return summary;
  } catch (error) {
    throw toAppError("Falha ao calcular sumário de transparência", error);
  }
}
