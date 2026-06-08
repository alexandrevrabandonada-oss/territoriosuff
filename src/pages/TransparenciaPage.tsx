import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { SkeletonCard } from "../components/SkeletonCard";
import { SurfaceCard } from "../components/BrandSystem";
import { PortalHero, PortalPageShell, PortalSectionHeader } from "../components/portal";
import {
  getTransparencySummary,
  listExpenses,
  listTransparencyLinks,
  type Expense,
  type TransparencyLink,
  type TransparencySummary
} from "../lib/api";
import { trackCsvDownload } from "../lib/observability";

import { INSTITUTIONAL_FUNDING } from "../content/institucional";

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}

function toCsvCell(value: unknown) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function getMonthYear(dateStr: string): { month: string; year: string } {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return { month, year };
}

function normalizeMonthParam(value: string | null): string {
  if (!value) return "all";
  if (value === "all") return value;
  const month = Number.parseInt(value, 10);
  if (!Number.isFinite(month) || month < 1 || month > 12) return "all";
  return String(month).padStart(2, "0");
}

export function TransparenciaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary] = useState<TransparencySummary | null>(null);
  const [links, setLinks] = useState<TransparencyLink[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerExpense, setViewerExpense] = useState<Expense | null>(null);

  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [vendorQuery, setVendorQuery] = useState("");
  const [filtersHydrated, setFiltersHydrated] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const month = normalizeMonthParam(searchParams.get("month"));
    const year = searchParams.get("year") || "all";
    const category = searchParams.get("category") || "all";
    const q = searchParams.get("q") || "";

    setSelectedMonth((current) => (current === month ? current : month));
    setSelectedYear((current) => (current === year ? current : year));
    setSelectedCategory((current) => (current === category ? current : category));
    setVendorQuery((current) => (current === q ? current : q));
    setFiltersHydrated(true);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [sumData, linkData, expData] = await Promise.all([
          getTransparencySummary(),
          listTransparencyLinks(),
          listExpenses(2000)
        ]);
        if (!cancelled) {
          setSummary(sumData);
          setLinks(linkData);
          setExpenses(expData);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar dados.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (viewerExpense) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      window.setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus();
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (!viewerExpense) return;
      if (ev.key === "Escape") {
        setViewerExpense(null);
        return;
      }
      if (ev.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')
        );
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
  }, [viewerExpense]);

  useEffect(() => {
    if (!filtersHydrated) return;

    const nextParams = new URLSearchParams();
    if (selectedMonth !== "all") nextParams.set("month", selectedMonth);
    if (selectedYear !== "all") nextParams.set("year", selectedYear);
    if (selectedCategory !== "all") nextParams.set("category", selectedCategory);
    if (vendorQuery.trim()) nextParams.set("q", vendorQuery.trim());

    const current = searchParams.toString();
    const next = nextParams.toString();
    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filtersHydrated, selectedMonth, selectedYear, selectedCategory, vendorQuery, searchParams, setSearchParams]);

  const monthOptions = useMemo(() => {
    const values = new Set<string>();
    expenses.forEach((exp) => values.add(getMonthYear(exp.occurred_on).month));
    if (selectedMonth !== "all") values.add(selectedMonth);
    return Array.from(values).sort((a, b) => Number(a) - Number(b));
  }, [expenses, selectedMonth]);

  const yearOptions = useMemo(() => {
    const values = new Set<string>();
    expenses.forEach((exp) => values.add(getMonthYear(exp.occurred_on).year));
    if (selectedYear !== "all") values.add(selectedYear);
    return Array.from(values).sort((a, b) => Number(b) - Number(a));
  }, [expenses, selectedYear]);

  const categoryOptions = useMemo(() => {
    const values = new Set(expenses.map((exp) => exp.category));
    if (selectedCategory !== "all") values.add(selectedCategory);
    return Array.from(values).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [expenses, selectedCategory]);

  const filteredExpenses = useMemo(() => {
    const vendorTerm = vendorQuery.trim().toLowerCase();
    return expenses
      .filter((exp) => {
        const { month, year } = getMonthYear(exp.occurred_on);
        if (selectedMonth !== "all" && month !== selectedMonth) return false;
        if (selectedYear !== "all" && year !== selectedYear) return false;
        if (selectedCategory !== "all" && exp.category !== selectedCategory) return false;
        if (vendorTerm && !exp.vendor.toLowerCase().includes(vendorTerm)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.occurred_on).getTime() - new Date(a.occurred_on).getTime());
  }, [expenses, selectedMonth, selectedYear, selectedCategory, vendorQuery]);

  const periodKpis = useMemo(() => {
    const total = filteredExpenses.reduce((acc, exp) => acc + exp.amount_cents, 0);

    const byCategory = filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] ?? 0) + exp.amount_cents;
      return acc;
    }, {} as Record<string, number>);

    const byVendor = filteredExpenses.reduce((acc, exp) => {
      acc[exp.vendor] = (acc[exp.vendor] ?? 0) + exp.amount_cents;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      topCategories: Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topVendors: Object.entries(byVendor).sort((a, b) => b[1] - a[1]).slice(0, 5),
      count: filteredExpenses.length
    };
  }, [filteredExpenses]);

  const handleDownloadExpensesCsv = () => {
    const header = ["occurred_on", "vendor", "category", "amount", "description", "document_url"];
    const rows = filteredExpenses.map((exp) => [
      exp.occurred_on,
      exp.vendor,
      exp.category,
      (exp.amount_cents / 100).toFixed(2),
      exp.description,
      exp.document_url ?? ""
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => toCsvCell(cell)).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gastos_transparencia_${selectedYear}_${selectedMonth}_${selectedCategory}_${new Date().toISOString().slice(0, 10)}.csv`;
    trackCsvDownload("transparencia", filteredExpenses.length);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        description={error}
        action={
          <button
            onClick={() => window.location.reload()}
            className="ui-btn-primary motion-focus motion-action px-5"
          >
            Tentar novamente
          </button>
        }
      />
    );
  }

  return (
    <PortalPageShell className="transparency-stage">
      <PortalHero
        badge={<span className="badge-metodologia">Prestação de contas</span>}
        title="Transparência e prestação de contas"
        subtitle="Acompanhamento financeiro público, auditável e exportável do projeto SEMEAR, com filtros por período, categoria e fornecedor."
        tone="lab"
        metrics={
          <>
          <div className="portal-kpi-card portal-kpi-card-lab">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Total histórico</p>
            <p className="mt-2 text-3xl font-black text-success">{summary ? formatBRL(summary.total_cents) : "R$ 0,00"}</p>
            <p className="mt-1 text-sm text-text-secondary">publicado e auditável</p>
          </div>
          <div className="portal-kpi-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Período filtrado</p>
            <p className="mt-2 text-3xl font-black text-brand-primary">{formatBRL(periodKpis.total)}</p>
            <p className="mt-1 text-sm text-text-secondary">{periodKpis.count} lançamento(s)</p>
          </div>
          </>
        }
      />

      <SurfaceCard className="portal-list-panel p-5 md:p-6">
          <p className="text-sm font-semibold text-accent-lab">{INSTITUTIONAL_FUNDING} · todos os recursos são públicos</p>
          <p className="mt-1 text-sm text-text-secondary">Prestação de contas permanente e acessível à população</p>
      </SurfaceCard>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="portal-kpi-card portal-kpi-card-lab">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Total histórico</p>
          <p className="mt-2 text-3xl font-black text-success">{summary ? formatBRL(summary.total_cents) : "R$ 0,00"}</p>
          <p className="mt-1 text-xs text-text-secondary">{INSTITUTIONAL_FUNDING}</p>
        </div>

        <div className="portal-kpi-card">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Total no período filtrado</p>
          <p className="mt-2 text-3xl font-black text-brand-primary">{formatBRL(periodKpis.total)}</p>
          <p className="mt-1 text-xs text-text-secondary">{periodKpis.count} lançamento(s)</p>
        </div>

        <div className="portal-kpi-card">
          <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Top categorias (período)</p>
          <div className="mt-2 space-y-1">
            {periodKpis.topCategories.slice(0, 3).map(([cat, amount]) => (
              <div key={cat} className="flex justify-between text-xs">
                <span className="text-text-secondary">{cat}</span>
                <span className="font-bold text-text-primary">{formatBRL(amount)}</span>
              </div>
            ))}
            {periodKpis.topCategories.length === 0 && <p className="text-xs text-text-secondary">Sem dados no filtro.</p>}
          </div>
        </div>
      </section>

      <SurfaceCard className="portal-filter-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Filtro ativo"
          title="Filtrar lançamentos"
          subtitle="Refine a prestação de contas por período, categoria ou fornecedor sem alterar a base publicada."
        />
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <label htmlFor="filtro-mes" className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-secondary">Mês</label>
            <select id="filtro-mes" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="motion-input motion-focus w-full rounded-md px-3 py-2 text-sm">
              <option value="all">Todos</option>
              {monthOptions.map((month) => <option key={month} value={month}>{month}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-ano" className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-secondary">Ano</label>
            <select id="filtro-ano" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="motion-input motion-focus w-full rounded-md px-3 py-2 text-sm">
              <option value="all">Todos</option>
              {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-categoria" className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-secondary">Categoria</label>
            <select id="filtro-categoria" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="motion-input motion-focus w-full rounded-md px-3 py-2 text-sm">
              <option value="all">Todas</option>
              {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-fornecedor" className="mb-1 block text-xs font-bold uppercase tracking-wide text-text-secondary">Fornecedor (busca)</label>
            <input id="filtro-fornecedor" type="search" value={vendorQuery} onChange={(e) => setVendorQuery(e.target.value)} placeholder="Digite o nome" className="motion-input motion-focus w-full rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
      </SurfaceCard>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="portal-list-panel rounded-[1.75rem] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Top categorias (filtro ativo)</h3>
          <div className="mt-3 space-y-2">
            {periodKpis.topCategories.map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{cat}</span>
                <span className="font-bold text-text-primary">{formatBRL(amount)}</span>
              </div>
            ))}
            {periodKpis.topCategories.length === 0 && <p className="text-sm text-text-secondary">Sem dados.</p>}
          </div>
        </div>

        <div className="portal-list-panel rounded-[1.75rem] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Top fornecedores (filtro ativo)</h3>
          <div className="mt-3 space-y-2">
            {periodKpis.topVendors.map(([vendor, amount]) => (
              <div key={vendor} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{vendor}</span>
                <span className="font-bold text-text-primary">{formatBRL(amount)}</span>
              </div>
            ))}
            {periodKpis.topVendors.length === 0 && <p className="text-sm text-text-secondary">Sem dados.</p>}
          </div>
        </div>
      </section>

      <SurfaceCard className="portal-list-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Base aberta"
          title="Despesas lançadas"
          subtitle="Tabela pública com documentos associados quando disponíveis."
        />
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="mt-1 text-xs text-text-secondary">Documentos são publicados quando disponíveis.</p>
          </div>
          <button type="button" onClick={handleDownloadExpensesCsv} className="ui-btn-secondary motion-focus motion-action px-4">
            Baixar CSV do filtro
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border-subtle" aria-label="Tabela de despesas filtradas">
          <table className="w-full border-collapse text-left text-base" aria-describedby="caption-despesas">
            <caption id="caption-despesas" className="sr-only">Tabela de despesas com filtros por mês, ano, categoria e fornecedor. Ordenada por data decrescente.</caption>
            <thead>
              <tr className="border-b border-border-subtle bg-bg-surface">
                <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Data</th>
                <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Favorecido</th>
                <th className="hidden px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary md:table-cell">Categoria</th>
                <th className="px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-secondary">Descrição</th>
                <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-wider text-text-secondary">Valor</th>
                <th className="px-4 py-3 text-right text-sm font-bold uppercase tracking-wider text-text-secondary">Documento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="motion-control hover:bg-bg-surface">
                  <td className="whitespace-nowrap px-4 py-4 font-mono text-sm text-text-secondary">{new Date(exp.occurred_on).toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-4 font-semibold text-text-primary">{exp.vendor}</td>
                  <td className="hidden px-4 py-4 md:table-cell"><span className="inline-block rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">{exp.category}</span></td>
                  <td className="max-w-[220px] px-4 py-4 text-sm text-text-secondary line-clamp-1">{exp.description}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-right text-base font-bold text-success">{formatBRL(exp.amount_cents)}</td>
                  <td className="px-4 py-4 text-right">
                    {exp.document_url ? (
                      <button
                        type="button"
                        onClick={() => setViewerExpense(exp)}
                        className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-brand-primary hover:underline"
                      >
                        Abrir documento
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-bg-surface px-2 py-1 text-xs font-semibold text-text-secondary">Sem documento</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12"><EmptyState title="Nenhum lançamento para os filtros selecionados" description="Ajuste mês, ano, categoria ou fornecedor para localizar outro lançamento." /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard className="portal-list-panel p-6 md:p-8">
        <PortalSectionHeader
          eyebrow="Controle externo"
          title="Links oficiais de controle"
          subtitle="Atalhos públicos para referências institucionais e acompanhamento complementar."
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group motion-list-item flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-surface p-4 motion-surface motion-surface-hover">
              <span className="inline-block rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">{link.kind}</span>
              <span className="text-base font-bold text-text-primary group-hover:text-brand-primary">{link.title}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-text-secondary">Acessar link externo</span>
            </a>
          ))}
          {links.length === 0 && (
            <div className="col-span-full"><EmptyState title="Nenhum link oficial disponível no momento" description="Os links oficiais aparecerão aqui quando forem publicados." /></div>
          )}
        </div>
      </SurfaceCard>

      {viewerExpense?.document_url && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center motion-overlay p-4 motion-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transparencia-viewer-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewerExpense(null);
          }}
        >
          <h2 id="transparencia-viewer-title" className="sr-only">Visualizador de documento</h2>
          <div ref={modalRef} className="motion-dialog-panel motion-dialog w-full max-w-5xl">
            <div className="mb-3 flex w-full justify-end gap-2">
              <a
                href={viewerExpense.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="motion-action inline-flex min-h-[44px] items-center rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                Abrir documento
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setViewerExpense(null)}
                className="motion-action inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-error px-3 text-white hover:bg-error/90"
                aria-label="Fechar visualizador de documento (ESC)"
              >
                ✕
              </button>
            </div>
            <iframe
              src={viewerExpense.document_url}
              title={`Documento de ${viewerExpense.vendor}`}
              className="motion-pop h-[80vh] w-full rounded-xl border border-white/20 bg-white"
            />
          </div>
        </div>
      )}
    </PortalPageShell>
  );
}




