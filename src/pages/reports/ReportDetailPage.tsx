import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { IconShell, SurfaceCard } from "../../components/BrandSystem";
import { BrandIllustratedEmptyState, BrandRadialDivider, BrandTextureSkeleton } from "../../components/BrandMicro";
import { OfflineBanner } from "../../components/OfflineBanner";
import { TextToSpeechButton } from "../../components/TextToSpeechButton";
import { getReportBySlug, type ReportDocument } from "../../lib/api";
import { trackShare } from "../../lib/observability";
import { usePageMetadata } from "../../hooks/usePageMetadata";

function getReportOpenKey(slug: string): string {
  return `report_pdf_opened_${slug}`;
}

export function ReportDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [report, setReport] = useState<ReportDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);

  usePageMetadata({
    title: report?.title,
    description: report?.summary || undefined,
    image: report?.cover_thumb_url || report?.cover_url || undefined,
    url: report ? `${window.location.origin}/s/relatorios/${report.slug}` : undefined,
    type: "article",
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reportSlug = slug;
    if (!reportSlug) return;
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const data = await getReportBySlug(String(reportSlug));
        if (!cancelled) {
          setReport(data);
          const opened = localStorage.getItem(getReportOpenKey(String(reportSlug))) === "1";
          setHasOpenedBefore(opened);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar relatório.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (isViewerOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus();
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (!isViewerOpen) return;

      if (ev.key === "Escape") {
        setIsViewerOpen(false);
        return;
      }

      if (ev.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (ev.shiftKey && active === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && active === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isViewerOpen]);

  if (loading) {
    return <BrandTextureSkeleton className="rounded-[1.75rem]" lines={5} />;
  }

  if (error) {
    return (
      <p aria-live="assertive" className="rounded-md border border-error bg-error/10 p-3 text-base text-error" role="alert">
        {error}
      </p>
    );
  }

  if (!report) {
    return (
      <BrandIllustratedEmptyState
        title="Relatório não encontrado"
        description="O documento solicitado pode ter sido removido ou ainda não disponibilizado."
        icon={<span className="text-2xl" aria-hidden="true">📄</span>}
      />
    );
  }

  const hasPdf = Boolean(report.pdf_url);
  const canOpenOffline = isOnline || hasOpenedBefore;

  const markAsOpened = () => {
    localStorage.setItem(getReportOpenKey(report.slug), "1");
    setHasOpenedBefore(true);
  };

  const handleOpenPdf = () => {
    if (!canOpenOffline) return;
    markAsOpened();
    setIsViewerOpen(true);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/s/relatorios/${report.slug}`;
    trackShare("relatorios", report.slug, "detail");
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.summary || undefined,
          url: shareUrl
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    trackShare("relatorios", report.slug, "detail-copy");
    await navigator.clipboard.writeText(shareUrl);
    alert("Link de compartilhamento copiado.");
  };

  return (
    <section className="portal-stage report-detail-stage space-y-8 md:space-y-10">
      <Link to="/relatorios" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary/70 hover:text-brand-primary">
        ← Voltar aos relatórios
      </Link>

      {!isOnline && (
        <OfflineBanner
          description={hasOpenedBefore ? "Este PDF já foi aberto neste dispositivo. Você pode tentar novamente pelo cache local." : "Este PDF ainda não foi aberto neste dispositivo. Conecte-se à internet para baixar e visualizar."}
          onRetry={() => window.location.reload()}
        />
      )}

      <SurfaceCard className="portal-detail-article p-5 md:p-8">
        <div className="mb-5 flex items-center gap-3">
          <IconShell tone="warm" className="h-12 w-12 rounded-2xl"><span aria-hidden="true">📄</span></IconShell>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">Documento oficial</p>
        </div>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-[-0.045em] text-text-primary md:text-5xl">{report.title}</h1>
        {report.summary && <p className="mt-3 text-base leading-relaxed text-text-secondary">{report.summary}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
          <span>{report.published_at ? new Date(report.published_at).toLocaleDateString("pt-BR") : "Sem data de publicação"}</span>
          {typeof report.year === "number" && <span>Ano: {report.year}</span>}
        </div>

        <div className="mt-5">
          <TextToSpeechButton
            label="Ouvir resumo"
            title={report.title}
            text={report.summary || "Relatório disponível para consulta em PDF."}
          />
        </div>

        {report.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {report.tags.map((tag) => (
              <span key={tag} className="ui-tag-signature">
                {tag}
              </span>
            ))}
          </div>
        )}

        <BrandRadialDivider className="radial-divider-subtle mt-4" />

        <div className="mt-6 flex flex-wrap gap-2.5 md:gap-3">
          <button
            type="button"
            disabled={!hasPdf || !canOpenOffline}
            onClick={handleOpenPdf}
            className="ui-btn-primary motion-focus px-5 max-sm:w-full max-sm:justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            Abrir PDF
          </button>

          <button
            type="button"
            onClick={() => { void handleShare(); }}
            className="ui-btn-secondary motion-focus px-5 max-sm:w-full max-sm:justify-center"
          >
            Copiar ou compartilhar
          </button>

          {hasPdf && (
            <a
              href={report.pdf_url as string}
              target="_blank"
              rel="noopener noreferrer"
              onClick={markAsOpened}
              className="ui-btn-secondary motion-focus px-5 max-sm:w-full max-sm:justify-center"
            >
              Abrir em nova aba
            </a>
          )}

          {!isOnline && !hasOpenedBefore && (
            <a
              href="/relatorios"
              className="motion-action inline-flex min-h-[44px] items-center rounded-lg border border-amber-500/30 bg-amber-50 px-5 py-3 text-sm font-bold uppercase tracking-wide text-amber-900"
            >
              Voltar aos relatórios
            </a>
          )}
        </div>
      </SurfaceCard>

      {isViewerOpen && hasPdf && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center motion-overlay p-4 motion-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-viewer-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsViewerOpen(false);
          }}
        >
          <h2 id="report-viewer-title" className="sr-only">Visualizador de PDF do relatório</h2>

          <div ref={modalRef} className="motion-dialog-panel motion-dialog w-full max-w-6xl">
            <div className="mb-3 flex w-full justify-end gap-2">
              <a
                href={report.pdf_url as string}
                target="_blank"
                rel="noopener noreferrer"
                onClick={markAsOpened}
                className="motion-action inline-flex min-h-[44px] items-center rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Abrir em nova aba
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsViewerOpen(false)}
                className="motion-action inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-error px-3 text-white hover:bg-error/90"
                aria-label="Fechar visualizador de PDF (ESC)"
              >
                ✕
              </button>
            </div>

            <iframe
              src={report.pdf_url as string}
              title={report.title}
              onLoad={markAsOpened}
              className="h-[80vh] w-full rounded-xl border border-white/20 bg-white"
            />
          </div>
        </div>
      )}
    </section>
  );
}



