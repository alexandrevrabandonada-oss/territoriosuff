import { SurfaceCard } from "../BrandSystem";
import type { BudgetSlice } from "../../content/programaUffTerritorio";

type BudgetBreakdownProps = {
  items: BudgetSlice[];
  totalLabel: string;
};

export function BudgetBreakdown({ items, totalLabel }: BudgetBreakdownProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => {
          const gradient = index % 3 === 0
            ? "from-brand-primary to-[#0d7bc8]"
            : index % 3 === 1
              ? "from-accent-lab to-[#11889a]"
              : "from-accent-seed to-[#76b91f]";

          return (
            <SurfaceCard key={item.label} className="rounded-[1.6rem] border-border-subtle bg-white p-4 md:p-5">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black leading-tight text-text-primary md:text-lg">{item.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{item.summary}</p>
                  </div>
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border-subtle text-center"
                    style={{
                      background: `conic-gradient(${index % 3 === 0 ? "#005DAA" : index % 3 === 1 ? "#00B7B1" : "#A3D832"} ${item.share * 3.6}deg, #eef4f8 0deg)`
                    }}
                    aria-hidden="true"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-black text-text-primary">{item.share}%</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    <span>Participação</span>
                    <span>{item.amountLabel}</span>
                  </div>
                  <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${item.share}%` }} />
                  <div className="h-3 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
                    <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              </div>
            </SurfaceCard>
          );
        })}
      </div>

      <div className="space-y-4">
        <SurfaceCard className="rounded-[1.75rem] border-brand-primary/12 bg-gradient-to-br from-brand-primary-soft via-white to-surface-2 p-6 md:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-primary-dark">Leitura geral</p>
          <h3 className="mt-2 text-3xl font-black text-text-primary">{totalLabel}</h3>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            O orçamento preliminar prioriza presença territorial, equipe, integração de dados e entregas públicas, mantendo a expansão tecnológica ancorada na base já existente do SEMEAR.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-border-subtle bg-white/80 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Base existente</p>
              <p className="mt-1 text-2xl font-black text-text-primary">1</p>
              <p className="mt-1 text-sm text-text-secondary">plataforma expandida, sem duplicação de app</p>
            </div>
            <div className="rounded-[1.25rem] border border-border-subtle bg-white/80 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Entregas</p>
              <p className="mt-1 text-2xl font-black text-text-primary">4</p>
              <p className="mt-1 text-sm text-text-secondary">frentes conectadas na mesma governança</p>
            </div>
            <div className="rounded-[1.25rem] border border-border-subtle bg-white/80 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Horizonte</p>
              <p className="mt-1 text-2xl font-black text-text-primary">24</p>
              <p className="mt-1 text-sm text-text-secondary">meses para consolidar e replicar</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-[1.75rem] border-accent-yellow/30 bg-[#fff8ee] p-6 md:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-brown">Premissa de eficiência</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            A plataforma digital é uma expansão da arquitetura atual, não uma criação do zero. Isso reduz custo de implantação, acelera cronograma e preserva padrões técnicos, editoriais e institucionais já consolidados.
          </p>
        </SurfaceCard>
      </div>
    </div>
  );
}