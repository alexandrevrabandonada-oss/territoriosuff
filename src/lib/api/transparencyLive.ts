import {
  assertSupabase,
  toAppError,
  type LiveTransparencyCountItem,
  type LiveTransparencyMonthlyReport
} from "./core";

export type { LiveTransparencyCountItem, LiveTransparencyMonthlyReport } from "./core";

function normalizeCountItems(value: unknown): LiveTransparencyCountItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const label = item && typeof item === "object" && "label" in item ? String(item.label ?? "").trim() : "";
      const countValue = item && typeof item === "object" && "count" in item ? Number(item.count ?? 0) : 0;
      return {
        label,
        count: Number.isFinite(countValue) ? countValue : 0
      };
    })
    .filter((item) => item.label.length > 0);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function rowToLiveTransparencyReport(row: Record<string, unknown>): LiveTransparencyMonthlyReport {
  const territorialStatus = String(row.territorial_status ?? "atencao");
  const status = String(row.status ?? "draft");

  return {
    id: String(row.id),
    month_key: String(row.month_key ?? ""),
    month_label: String(row.month_label ?? ""),
    source_asset_id: typeof row.source_asset_id === "string" ? row.source_asset_id : null,
    source_url: typeof row.source_url === "string" ? row.source_url : null,
    source_label: typeof row.source_label === "string" ? row.source_label : null,
    exported_at: typeof row.exported_at === "string" ? row.exported_at : null,
    actions_count: Number(row.actions_count ?? 0),
    hearings_count: Number(row.hearings_count ?? 0),
    territorial_coverage_pct: Number(row.territorial_coverage_pct ?? 0),
    territorial_status:
      territorialStatus === "critica" || territorialStatus === "adequada" ? territorialStatus : "atencao",
    executive_summary: String(row.executive_summary ?? ""),
    methodological_alert: String(row.methodological_alert ?? ""),
    operational_recommendation: String(row.operational_recommendation ?? ""),
    dominant_themes: normalizeStringArray(row.dominant_themes),
    action_territories: normalizeStringArray(row.action_territories),
    hearing_territories: normalizeStringArray(row.hearing_territories),
    grouped_priorities: normalizeCountItems(row.grouped_priorities),
    qualitative_signals: normalizeCountItems(row.qualitative_signals),
    recommended_next_steps: normalizeStringArray(row.recommended_next_steps),
    actions_performed: normalizeStringArray(row.actions_performed),
    review_pending: String(row.review_pending ?? ""),
    status: status === "published" || status === "archived" ? status : "draft",
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? "")
  };
}

export async function listLiveTransparencyReports(includeDrafts = false): Promise<LiveTransparencyMonthlyReport[]> {
  try {
    const supabase = assertSupabase();
    let query = supabase
      .from("transparency_live_reports")
      .select("*")
      .order("month_key", { ascending: false });

    if (!includeDrafts) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[]).map(rowToLiveTransparencyReport);
  } catch (error) {
    throw toAppError("Falha ao listar fechamentos de transparencia viva", error);
  }
}
