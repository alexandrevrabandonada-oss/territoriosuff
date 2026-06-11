import { Link } from "react-router-dom";
import { IconShell, SurfaceCard } from "../BrandSystem";

export function IneaStorySummaryCard() {
  return (
    <SurfaceCard className="border border-brand-primary/15 bg-gradient-to-br from-indigo-50/10 via-slate-50 to-emerald-50/10 p-5 rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-brand-primary/30">
      {/* Decorative colored glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <IconShell tone="lab" className="shrink-0 bg-brand-primary/10 text-brand-primary">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </IconShell>
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
              A História dos Dados Oficiais
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              Série Histórica INEA em Foco
            </p>
          </div>
        </div>

        {/* Bullet stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-3 bg-white/60 border border-slate-100 rounded-xl space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Período</span>
            <strong className="text-xs font-black text-slate-700 block">2013–2026</strong>
            <span className="text-[9px] text-slate-400 font-bold block">Camadas em revisão</span>
          </div>

          <div className="p-3 bg-white/60 border border-slate-100 rounded-xl space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Estações</span>
            <strong className="text-xs font-black text-slate-700 block">4 Oficiais</strong>
            <span className="text-[9px] text-slate-400 font-bold block">Volta Redonda</span>
          </div>

          <div className="p-3 bg-white/60 border border-slate-100 rounded-xl space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Memória 2013-2015</span>
            <strong className="text-xs font-black text-slate-700 block">PM10 convergente</strong>
            <span className="text-[9px] text-slate-400 font-bold block">PTS técnico, O3 em auditoria</span>
          </div>

          <div className="p-3 bg-white/60 border border-slate-100 rounded-xl space-y-0.5">
            <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Gargalo Crítico</span>
            <strong className="text-xs font-black text-amber-800 block">Lacunas de Transmissão</strong>
            <span className="text-[9px] text-amber-700/80 font-bold block">Falta de dados frequente</span>
          </div>
        </div>

        {/* Description & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xl">
            Entenda como a base pública recente se conecta à memória histórica recuperada, onde o ar foi medido e por que lacunas, métricas em auditoria e evidências científicas precisam aparecer juntas.
          </p>
          <Link
            to="/qualidade-ar/inea/historia"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary-dark transition-all shrink-0 shadow-xs"
          >
            <span>Abrir história completa</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </SurfaceCard>
  );
}
