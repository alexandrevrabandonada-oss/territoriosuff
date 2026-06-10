import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { formatAssetSize, getMediaAssetById, type MediaAssetRecord } from "../../lib/admin/media";
import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";
import type { ParsedLiveTransparencyDraft } from "../../lib/transparencyLiveParser";

let pdfExtractionRuntimePromise: Promise<typeof import("../../lib/extractPdfText")> | null = null;
let transparencyParserRuntimePromise: Promise<typeof import("../../lib/transparencyLiveParser")> | null = null;

async function loadPdfExtractionRuntime() {
  if (!pdfExtractionRuntimePromise) {
    pdfExtractionRuntimePromise = import("../../lib/extractPdfText");
  }

  return pdfExtractionRuntimePromise;
}

async function loadTransparencyParserRuntime() {
  if (!transparencyParserRuntimePromise) {
    transparencyParserRuntimePromise = import("../../lib/transparencyLiveParser");
  }

  return transparencyParserRuntimePromise;
}

function normalizeMonthLabel(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

function parseLines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(value?: string[] | null): string {
  return (value || []).join("\n");
}

function parseCountItems(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelPart, countPart] = line.split("|");
      const label = (labelPart || "").trim();
      const count = Number((countPart || "").trim());
      return { label, count: Number.isFinite(count) ? count : 0 };
    })
    .filter((item) => item.label.length > 0);
}

function joinCountItems(items?: Array<{ label: string; count: number }> | null) {
  return (items || []).map((item) => `${item.label} | ${item.count}`).join("\n");
}

function applyParsedDraft(
  parsed: ParsedLiveTransparencyDraft,
  fallback: {
    monthKey: string;
    monthLabel: string;
    sourceUrl: string;
    sourceLabel: string;
    exportedAt: string;
    actionsCount: string;
    hearingsCount: string;
    territorialCoveragePct: string;
    territorialStatus: "critica" | "atencao" | "adequada";
    executiveSummary: string;
    methodologicalAlert: string;
    operationalRecommendation: string;
    reviewPending: string;
  },
  setters: {
    setMonthKey: (value: string) => void;
    setMonthLabel: (value: string) => void;
    setSourceUrl: (value: string) => void;
    setSourceLabel: (value: string) => void;
    setExportedAt: (value: string) => void;
    setActionsCount: (value: string) => void;
    setHearingsCount: (value: string) => void;
    setTerritorialCoveragePct: (value: string) => void;
    setTerritorialStatus: (value: "critica" | "atencao" | "adequada") => void;
    setExecutiveSummary: (value: string) => void;
    setMethodologicalAlert: (value: string) => void;
    setOperationalRecommendation: (value: string) => void;
    setDominantThemes: (value: string) => void;
    setActionTerritories: (value: string) => void;
    setHearingTerritories: (value: string) => void;
    setGroupedPriorities: (value: string) => void;
    setQualitativeSignals: (value: string) => void;
    setRecommendedNextSteps: (value: string) => void;
    setActionsPerformed: (value: string) => void;
    setReviewPending: (value: string) => void;
  }
) {
  setters.setMonthKey(parsed.monthKey || fallback.monthKey);
  setters.setMonthLabel(parsed.monthLabel || fallback.monthLabel);
  setters.setSourceUrl(parsed.sourceUrl || fallback.sourceUrl);
  setters.setSourceLabel(parsed.sourceLabel || fallback.sourceLabel);
  setters.setExportedAt(parsed.exportedAt || fallback.exportedAt);
  setters.setActionsCount(parsed.actionsCount || fallback.actionsCount);
  setters.setHearingsCount(parsed.hearingsCount || fallback.hearingsCount);
  setters.setTerritorialCoveragePct(parsed.territorialCoveragePct || fallback.territorialCoveragePct);
  setters.setTerritorialStatus(parsed.territorialStatus || fallback.territorialStatus);
  setters.setExecutiveSummary(parsed.executiveSummary || fallback.executiveSummary);
  setters.setMethodologicalAlert(parsed.methodologicalAlert || fallback.methodologicalAlert);
  setters.setOperationalRecommendation(parsed.operationalRecommendation || fallback.operationalRecommendation);
  setters.setDominantThemes(parsed.dominantThemes.join("\n"));
  setters.setActionTerritories(parsed.actionTerritories.join("\n"));
  setters.setHearingTerritories(parsed.hearingTerritories.join("\n"));
  setters.setGroupedPriorities(joinCountItems(parsed.groupedPriorities));
  setters.setQualitativeSignals(joinCountItems(parsed.qualitativeSignals));
  setters.setRecommendedNextSteps(parsed.recommendedNextSteps.join("\n"));
  setters.setActionsPerformed(parsed.actionsPerformed.join("\n"));
  setters.setReviewPending(parsed.reviewPending || fallback.reviewPending);
}

export function AdminTransparencyLiveEditPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const location = useLocation();
  const assetIdFromUrl = new URLSearchParams(location.search).get("assetId");

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [monthKey, setMonthKey] = useState("");
  const [monthLabel, setMonthLabel] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceLabel, setSourceLabel] = useState("Relatorio mensal interpretativo");
  const [exportedAt, setExportedAt] = useState("");
  const [actionsCount, setActionsCount] = useState("0");
  const [hearingsCount, setHearingsCount] = useState("0");
  const [territorialCoveragePct, setTerritorialCoveragePct] = useState("0");
  const [territorialStatus, setTerritorialStatus] = useState<"critica" | "atencao" | "adequada">("atencao");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [methodologicalAlert, setMethodologicalAlert] = useState("");
  const [operationalRecommendation, setOperationalRecommendation] = useState("");
  const [dominantThemes, setDominantThemes] = useState("");
  const [actionTerritories, setActionTerritories] = useState("");
  const [hearingTerritories, setHearingTerritories] = useState("");
  const [groupedPriorities, setGroupedPriorities] = useState("");
  const [qualitativeSignals, setQualitativeSignals] = useState("");
  const [recommendedNextSteps, setRecommendedNextSteps] = useState("");
  const [actionsPerformed, setActionsPerformed] = useState("");
  const [reviewPending, setReviewPending] = useState("Nenhuma pendencia registrada.");
  const [rawReportText, setRawReportText] = useState("");
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfFileName, setPdfFileName] = useState("");
  const [recentPdfAssets, setRecentPdfAssets] = useState<MediaAssetRecord[]>([]);
  const [selectedPdfAssetId, setSelectedPdfAssetId] = useState("");
  const [selectedPdfAsset, setSelectedPdfAsset] = useState<MediaAssetRecord | null>(null);
  const [duplicateMonthReport, setDuplicateMonthReport] = useState<{ id: string; month_key: string; month_label: string; status: string } | null>(null);

  const loadItem = useCallback(async () => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    setLoading(true);

    const [{ data: assets, error: assetsError }, reportResult] = await Promise.all([
      supabase
        .from("media_assets")
        .select("id, bucket, path, public_url, file_name, mime_type, size_bytes, title, description, alt_text, credit, source, acervo_content_type, content_category, source_date, source_name, source_url, tags, status, created_at")
        .eq("mime_type", "application/pdf")
        .order("created_at", { ascending: false })
        .limit(18),
      isNew
        ? Promise.resolve({ data: null, error: null })
        : supabase.from("transparency_live_reports").select("*").eq("id", id).single()
    ]);

    if (assetsError) {
      alert("Erro ao carregar PDFs recentes: " + assetsError.message);
    } else {
      setRecentPdfAssets((assets as MediaAssetRecord[]) || []);
    }

    if (!isNew) {
      const { data, error } = reportResult;
      if (error) {
        alert("Erro ao carregar fechamento mensal: " + error.message);
        navigate("/admin/transparencia-viva");
        return;
      }

      setMonthKey(data.month_key || "");
      setMonthLabel(data.month_label || "");
      setSelectedPdfAssetId(data.source_asset_id || "");
      setSourceUrl(data.source_url || "");
      setSourceLabel(data.source_label || "Relatorio mensal interpretativo");
      setExportedAt(data.exported_at || "");
      setActionsCount(String(data.actions_count ?? 0));
      setHearingsCount(String(data.hearings_count ?? 0));
      setTerritorialCoveragePct(String(data.territorial_coverage_pct ?? 0));
      setTerritorialStatus(data.territorial_status || "atencao");
      setStatus(data.status || "draft");
      setExecutiveSummary(data.executive_summary || "");
      setMethodologicalAlert(data.methodological_alert || "");
      setOperationalRecommendation(data.operational_recommendation || "");
      setDominantThemes(joinLines(data.dominant_themes));
      setActionTerritories(joinLines(data.action_territories));
      setHearingTerritories(joinLines(data.hearing_territories));
      setGroupedPriorities(joinCountItems(data.grouped_priorities));
      setQualitativeSignals(joinCountItems(data.qualitative_signals));
      setRecommendedNextSteps(joinLines(data.recommended_next_steps));
      setActionsPerformed(joinLines(data.actions_performed));
      setReviewPending(data.review_pending || "Nenhuma pendencia registrada.");

      if (data.source_asset_id) {
        const asset = await getMediaAssetById(data.source_asset_id);
        setSelectedPdfAsset(asset);
        if (asset?.file_name || asset?.title) {
          setPdfFileName(asset.file_name || asset.title);
        }
      }
    }

    setLoading(false);
  }, [id, isNew, navigate]);

  useEffect(() => {
    void loadItem();
  }, [loadItem]);

  useEffect(() => {
    let active = true;

    async function checkDuplicateMonth() {
      const client = await getSupabaseClientOrNull();
      if (!client || !monthKey.trim()) {
        if (active) setDuplicateMonthReport(null);
        return;
      }

      let query = client
        .from("transparency_live_reports")
        .select("id, month_key, month_label, status")
        .eq("month_key", monthKey.trim())
        .limit(1);

      if (!isNew && id) {
        query = query.neq("id", id);
      }

      const { data, error } = await query.maybeSingle();
      if (!active) return;

      if (error) {
        setDuplicateMonthReport(null);
        return;
      }

      setDuplicateMonthReport(data || null);
    }

    void checkDuplicateMonth();

    return () => {
      active = false;
    };
  }, [id, isNew, monthKey]);

  const applyParsed = (parsed: ParsedLiveTransparencyDraft) => {
    applyParsedDraft(
      parsed,
      {
        monthKey,
        monthLabel,
        sourceUrl,
        sourceLabel,
        exportedAt,
        actionsCount,
        hearingsCount,
        territorialCoveragePct,
        territorialStatus,
        executiveSummary,
        methodologicalAlert,
        operationalRecommendation,
        reviewPending
      },
      {
        setMonthKey,
        setMonthLabel,
        setSourceUrl,
        setSourceLabel,
        setExportedAt,
        setActionsCount,
        setHearingsCount,
        setTerritorialCoveragePct,
        setTerritorialStatus,
        setExecutiveSummary,
        setMethodologicalAlert,
        setOperationalRecommendation,
        setDominantThemes,
        setActionTerritories,
        setHearingTerritories,
        setGroupedPriorities,
        setQualitativeSignals,
        setRecommendedNextSteps,
        setActionsPerformed,
        setReviewPending
      }
    );
  };

  const extractAndApplyText = async (text: string) => {
    setRawReportText(text);
    const { parseLiveTransparencyReportText } = await loadTransparencyParserRuntime();
    const parsed = parseLiveTransparencyReportText(text);
    applyParsed(parsed);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;

    if (!monthKey.trim() || !monthLabel.trim()) {
      alert("Mês de referência e rótulo do mês são obrigatórios.");
      return;
    }

    if (!executiveSummary.trim() || !methodologicalAlert.trim() || !operationalRecommendation.trim()) {
      alert("Leitura executiva, alerta metodológico e recomendação operacional são obrigatórios.");
      return;
    }

    if (duplicateMonthReport) {
      alert(`Já existe um fechamento para ${duplicateMonthReport.month_label || duplicateMonthReport.month_key}. Abra o registro existente antes de continuar.`);
      return;
    }

    setSaving(true);

    const payload = {
      month_key: monthKey.trim(),
      month_label: normalizeMonthLabel(monthLabel),
      source_asset_id: selectedPdfAssetId || null,
      source_url: sourceUrl.trim() || null,
      source_label: sourceLabel.trim() || null,
      exported_at: exportedAt || null,
      actions_count: Number(actionsCount) || 0,
      hearings_count: Number(hearingsCount) || 0,
      territorial_coverage_pct: Number(territorialCoveragePct) || 0,
      territorial_status: territorialStatus,
      executive_summary: executiveSummary.trim(),
      methodological_alert: methodologicalAlert.trim(),
      operational_recommendation: operationalRecommendation.trim(),
      dominant_themes: parseLines(dominantThemes),
      action_territories: parseLines(actionTerritories),
      hearing_territories: parseLines(hearingTerritories),
      grouped_priorities: parseCountItems(groupedPriorities),
      qualitative_signals: parseCountItems(qualitativeSignals),
      recommended_next_steps: parseLines(recommendedNextSteps),
      actions_performed: parseLines(actionsPerformed),
      review_pending: reviewPending.trim() || "Nenhuma pendencia registrada.",
      status
    };

    const result = isNew
      ? await supabase.from("transparency_live_reports").insert(payload).select("id").single()
      : await supabase.from("transparency_live_reports").update(payload).eq("id", id).select("id").single();

    setSaving(false);
    if (result.error) {
      alert("Erro ao salvar: " + result.error.message);
      return;
    }

    navigate("/admin/transparencia-viva");
  };

  const handleParseRawText = async () => {
    if (!rawReportText.trim()) {
      alert("Cole o texto do relatório antes de tentar pré-preencher.");
      return;
    }

    try {
      const { parseLiveTransparencyReportText } = await loadTransparencyParserRuntime();
      const parsed = parseLiveTransparencyReportText(rawReportText);
      applyParsed(parsed);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Falha ao interpretar o texto do relatório.");
    }
  };

  const handlePdfSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Selecione um arquivo PDF.");
      return;
    }

    setIsExtractingPdf(true);
    setPdfFileName(file.name);
    setSelectedPdfAssetId("");
    setSelectedPdfAsset(null);

    try {
      const { extractPdfText } = await loadPdfExtractionRuntime();
      const extractedText = await extractPdfText(file);
      await extractAndApplyText(extractedText);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Falha ao ler o PDF do relatório.");
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handleUseRecentPdf = async (asset: MediaAssetRecord) => {
    setIsExtractingPdf(true);
    setPdfFileName(asset.file_name || asset.title);
    setSelectedPdfAssetId(asset.id);
    setSelectedPdfAsset(asset);

    try {
      const response = await fetch(asset.public_url);
      if (!response.ok) {
        throw new Error(`Falha ao baixar o PDF selecionado (${response.status}).`);
      }

      const blob = await response.blob();
      const { extractPdfTextFromBlob } = await loadPdfExtractionRuntime();
      const extractedText = await extractPdfTextFromBlob(blob);
      await extractAndApplyText(extractedText);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Falha ao usar o PDF selecionado.");
    } finally {
      setIsExtractingPdf(false);
    }
  };

  useEffect(() => {
    if (!isNew || !assetIdFromUrl || isExtractingPdf) return;
    if (selectedPdfAssetId === assetIdFromUrl) return;

    let active = true;

    async function preloadAssetFromUrl() {
      const knownAsset = recentPdfAssets.find((asset) => asset.id === assetIdFromUrl);
      const asset = knownAsset || await getMediaAssetById(assetIdFromUrl as string);
      if (!active || !asset || asset.mime_type !== "application/pdf") return;
      await handleUseRecentPdf(asset);
    }

    void preloadAssetFromUrl();

    return () => {
      active = false;
    };
  }, [assetIdFromUrl, isExtractingPdf, isNew, recentPdfAssets, selectedPdfAssetId]);

  if (loading) {
    return <div className="p-20 text-center text-slate-400 italic font-medium">Carregando fechamento mensal...</div>;
  }

  return (
    <form className="admin-editor-page space-y-8 animate-in fade-in duration-500 pb-24" onSubmit={handleSave}>
      <div className="admin-editor-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Leitura editorial</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            {isNew ? "Novo fechamento mensal" : "Editar fechamento mensal"}
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">
            Estruture o resumo público das escutas com cobertura, sinais qualitativos e encaminhamentos.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/transparencia-viva" className="admin-command-ghost">Cancelar</Link>
          <button type="submit" disabled={saving} className="admin-command-cta">
            {saving ? "Salvando..." : "Salvar fechamento"}
          </button>
        </div>
      </div>

      <section className="rounded-[2rem] border border-violet-100 bg-violet-50/70 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <span className="admin-command-eyebrow">Pré-preenchimento</span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Colar texto do relatório mensal</h2>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Use o texto copiado ou um PDF local para preencher o formulário automaticamente. Revise o resultado antes de publicar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="admin-command-ghost cursor-pointer">
              {isExtractingPdf ? "Lendo PDF..." : "Ler PDF e preencher"}
              <input type="file" className="hidden" accept=".pdf,application/pdf" onChange={handlePdfSelected} disabled={isExtractingPdf} />
            </label>
            <button type="button" onClick={handleParseRawText} className="admin-command-cta">
              Preencher a partir do texto
            </button>
          </div>
        </div>
        <div className="mt-5 rounded-3xl border border-violet-200 bg-white/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Importação local</p>
          <p className="mt-2 text-sm font-medium text-slate-600">
            O PDF é lido no navegador e o texto extraído cai neste campo para revisão. Nada muda no banco até você salvar.
          </p>
          {pdfFileName ? (
            <p className="mt-3 text-sm font-semibold text-slate-900">Arquivo selecionado: {pdfFileName}</p>
          ) : null}
        </div>
        <div className="mt-5 rounded-3xl border border-violet-200 bg-white/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Documento de origem</p>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Este vínculo registra qual PDF sustentou a leitura editorial deste fechamento.
              </p>
            </div>
            {selectedPdfAsset ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedPdfAsset(null);
                  setSelectedPdfAssetId("");
                  setPdfFileName("");
                }}
                className="text-xs font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-rose-500"
              >
                limpar
              </button>
            ) : null}
          </div>
          {selectedPdfAsset ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-slate-400">{selectedPdfAsset.bucket}</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{selectedPdfAsset.title || selectedPdfAsset.file_name}</p>
                  <p className="mt-1 truncate text-xs font-medium text-slate-500">{selectedPdfAsset.file_name}</p>
                  <p className="mt-2 text-[11px] font-semibold text-slate-500">{formatAssetSize(selectedPdfAsset.size_bytes)}</p>
                </div>
                <a
                  href={selectedPdfAsset.public_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-colors hover:border-violet-300 hover:text-violet-700"
                >
                  abrir PDF
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs font-bold text-slate-400">
              Nenhum PDF de origem vinculado.
            </div>
          )}
        </div>
        <div className="mt-5 rounded-3xl border border-violet-200 bg-white/70 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">PDFs recentes do acervo</p>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Use um PDF já enviado ao portal para pré-preencher este fechamento mensal.
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-500">{recentPdfAssets.length} PDFs</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {recentPdfAssets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => void handleUseRecentPdf(asset)}
                disabled={isExtractingPdf}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  selectedPdfAssetId === asset.id
                    ? "border-violet-500 bg-violet-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-violet-300"
                } ${isExtractingPdf ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-slate-400">{asset.bucket}</p>
                    <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-900">{asset.title || asset.file_name}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">PDF</span>
                </div>
                <p className="mt-3 truncate text-xs font-medium text-slate-500">{asset.file_name}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">{formatAssetSize(asset.size_bytes)}</p>
              </button>
            ))}
          </div>
        </div>
        <textarea
          className="mt-5 min-h-56 w-full"
          value={rawReportText}
          onChange={(event) => setRawReportText(event.target.value)}
          placeholder="Cole aqui o texto bruto do relatório mensal exportado ou use Ler PDF e preencher."
        />
      </section>

      {duplicateMonthReport ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Duplicidade detectada</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Já existe um fechamento para este mês</h2>
              <p className="mt-2 text-sm font-medium text-slate-700">
                O mês <strong>{duplicateMonthReport.month_label || duplicateMonthReport.month_key}</strong> já está cadastrado no painel. Para evitar duplicidade, abra o registro existente e atualize por lá.
              </p>
            </div>
            <Link
              to={`/admin/transparencia-viva/${duplicateMonthReport.id}`}
              className="rounded-xl border border-amber-300 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-amber-800 transition-colors hover:border-amber-400 hover:bg-amber-100"
            >
              Abrir fechamento existente
            </Link>
          </div>
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="space-y-6 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label>Mês de referência (YYYY-MM)</label>
              <input value={monthKey} onChange={(event) => setMonthKey(event.target.value)} placeholder="2026-05" />
            </div>
            <div>
              <label>Rótulo público do mês</label>
              <input value={monthLabel} onChange={(event) => setMonthLabel(event.target.value)} placeholder="maio de 2026" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label>Ações</label>
              <input type="number" value={actionsCount} onChange={(event) => setActionsCount(event.target.value)} min="0" />
            </div>
            <div>
              <label>Escutas</label>
              <input type="number" value={hearingsCount} onChange={(event) => setHearingsCount(event.target.value)} min="0" />
            </div>
            <div>
              <label>Cobertura territorial (%)</label>
              <input type="number" step="0.1" value={territorialCoveragePct} onChange={(event) => setTerritorialCoveragePct(event.target.value)} min="0" />
            </div>
          </div>

          <div>
            <label>Leitura executiva</label>
            <textarea className="min-h-28" value={executiveSummary} onChange={(event) => setExecutiveSummary(event.target.value)} placeholder="Resumo geral do mês em linguagem pública." />
          </div>
          <div>
            <label>Alerta metodológico</label>
            <textarea className="min-h-24" value={methodologicalAlert} onChange={(event) => setMethodologicalAlert(event.target.value)} placeholder="Limites de leitura e cautelas do recorte." />
          </div>
          <div>
            <label>Recomendação operacional</label>
            <textarea className="min-h-24" value={operationalRecommendation} onChange={(event) => setOperationalRecommendation(event.target.value)} placeholder="Próximo movimento operacional recomendado." />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label>Temas dominantes (1 por linha)</label>
              <textarea className="min-h-32" value={dominantThemes} onChange={(event) => setDominantThemes(event.target.value)} placeholder="ar/poluicao&#10;po/sujeira&#10;saude" />
            </div>
            <div>
              <label>Territórios da ação (1 por linha)</label>
              <textarea className="min-h-32" value={actionTerritories} onChange={(event) => setActionTerritories(event.target.value)} placeholder="Vila Santa Cecilia&#10;Conforto" />
            </div>
          </div>

          <div>
            <label>Territórios de referência da escuta (1 por linha)</label>
            <textarea className="min-h-32" value={hearingTerritories} onChange={(event) => setHearingTerritories(event.target.value)} placeholder="Santo Agostinho&#10;Sessenta&#10;Retiro" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label>Prioridades agrupadas (`tema | quantidade`)</label>
              <textarea className="min-h-40" value={groupedPriorities} onChange={(event) => setGroupedPriorities(event.target.value)} placeholder={"Ar, poluicao e po | 29\nEmpresas e CSN | 20"} />
            </div>
            <div>
              <label>Sinais qualitativos (`tema | quantidade`)</label>
              <textarea className="min-h-40" value={qualitativeSignals} onChange={(event) => setQualitativeSignals(event.target.value)} placeholder={"Cuidado coletivo | 14\nSaude e desconforto | 1"} />
            </div>
          </div>

          <div>
            <label>Encaminhamentos recomendados (1 por linha)</label>
            <textarea className="min-h-40" value={recommendedNextSteps} onChange={(event) => setRecommendedNextSteps(event.target.value)} placeholder="Revisar escutas sem territorio...\nPreparar devolutiva publica..." />
          </div>

          <div>
            <label>Ações realizadas no mês (1 por linha)</label>
            <textarea className="min-h-40" value={actionsPerformed} onChange={(event) => setActionsPerformed(event.target.value)} placeholder="07/05/2026 | Banca Escuta UFF Vila | Vila Santa Cecilia" />
          </div>

          <div>
            <label>Pendência de revisão</label>
            <textarea className="min-h-24" value={reviewPending} onChange={(event) => setReviewPending(event.target.value)} placeholder="Nenhuma pendencia de revisao no mes." />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <label>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value as "draft" | "published" | "archived")}>
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Publicado aparece no portal público. Rascunho e arquivado ficam restritos ao admin.
            </p>
          </section>

          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <label>Status territorial</label>
            <select value={territorialStatus} onChange={(event) => setTerritorialStatus(event.target.value as "critica" | "atencao" | "adequada")}>
              <option value="critica">Crítica</option>
              <option value="atencao">Atenção</option>
              <option value="adequada">Adequada</option>
            </select>
            <div className="mt-5 grid gap-4">
              <div>
                <label>Link público do relatório</label>
                <input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://www.semearterritorios.online/relatorios/2026-05" />
              </div>
              <div>
                <label>Rótulo da fonte</label>
                <input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} placeholder="Relatorio mensal interpretativo" />
              </div>
              <div>
                <label>Data de exportação</label>
                <input type="date" value={exportedAt} onChange={(event) => setExportedAt(event.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Prévia estrutural</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{monthLabel || "mes de referencia"}</p>
                <p className="mt-2 text-lg font-black text-slate-950">{actionsCount || "0"} ações · {hearingsCount || "0"} escutas</p>
                <p className="mt-2 text-sm text-slate-600">{executiveSummary || "A leitura executiva aparece aqui."}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Cobertura territorial</p>
                <p className="mt-2 text-lg font-black text-slate-950">{territorialCoveragePct || "0"}%</p>
                <p className="mt-2 text-sm text-slate-600">{methodologicalAlert || "O alerta metodológico aparece aqui."}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
