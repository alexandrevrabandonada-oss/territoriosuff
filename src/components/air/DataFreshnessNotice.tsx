import { IconShell, SurfaceCard } from "../BrandSystem";

export function DataFreshnessNotice() {
  return (
    <SurfaceCard className="border border-slate-200 bg-slate-50 p-4 rounded-xl transition-all">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <IconShell tone="neutral" className="shrink-0">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </IconShell>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
            Atualização e Freshness dos Dados
          </h4>
          <p className="text-xs leading-relaxed text-slate-600 font-semibold">
            Os dados desta página vêm do arquivo público qualidade_ar.xlsx do INEA/Dados Abertos RJ. Eles representam a última base pública disponível no momento da ingestão, não monitoramento minuto a minuto.
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}
