import { IconShell, SurfaceCard } from "../BrandSystem";

export function MethodologyNotice() {
  return (
    <SurfaceCard className="border border-amber-500/20 bg-amber-50/40 p-5 rounded-2xl md:p-6 transition-all hover:border-amber-500/35">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <IconShell tone="warm" className="shrink-0">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </IconShell>
        <div className="space-y-1.5">
          <h3 className="font-black text-amber-950 uppercase tracking-wider text-xs">
            Importante: Entendendo os Dados
          </h3>
          <p className="text-sm leading-relaxed text-amber-900 font-semibold">
            Este painel não mostra a concentração bruta de poluentes. O arquivo público atual do INEA traz subíndices de qualidade do ar por poluente e o Índice IQAr geral. Eles são indicadores processados e adimensionais (sem unidade física de medida, como µg/m³ ou ppm).
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Subíndices vs Concentração Bruta:</strong> A concentração bruta é a quantidade física do poluente no ar. O subíndice é um valor de 0 a 500 calculado a partir dessa concentração para facilitar a compreensão pública de quão saudável o ar está.
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}
