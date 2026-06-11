import { RadarEvidenceBadge } from "./RadarEvidenceBadge";
import { RadarVisualNotice } from "./RadarVisualNotice";

const COVERAGE_LAYERS = [
  {
    title: "PM10",
    range: "2013-2026",
    status: "Camada histórica principal",
    tone: "strong" as const,
    detail: "Série plurianual já publicada no Radar, com média anual, pico horário, cobertura e excedências experimentais."
  },
  {
    title: "PM2.5",
    range: "2021-2026",
    status: "Camada respiratória fina",
    tone: "experimental" as const,
    detail: "Série pública mais curta; 2020 permanece como lacuna metodológica e não deve ser preenchido por inferência."
  },
  {
    title: "SO2 e CO",
    range: "2013-2026",
    status: "Expansão experimental",
    tone: "experimental" as const,
    detail: "Linhas do tempo já disponíveis para leitura complementar, com CO mantido em ppm e SO2 em microgramas por metro cúbico."
  },
  {
    title: "NO2",
    range: "Bloqueado",
    status: "Quarentena técnica",
    tone: "insufficient" as const,
    detail: "Permanece fora da camada pública operacional por salvaguarda editorial diante de anomalia de linha de base no Retiro."
  },
  {
    title: "O3 e PTS",
    range: "2013-2015",
    status: "Memória em auditoria",
    tone: "insufficient" as const,
    detail: "Foram recuperados no triênio histórico, mas não entram em alertas ou painéis consolidados antes de confirmar métrica, unidade e estabilidade."
  }
];

const RESEARCH_STEPS = [
  {
    label: "1. Matriz de disponibilidade",
    text: "Executar amostras pequenas por estação, poluente e ano antes de qualquer coleta longa."
  },
  {
    label: "2. Coleta incremental cacheada",
    text: "Baixar somente janelas faltantes, com sessão isolada por consulta e pausa entre chamadas."
  },
  {
    label: "3. Auditoria de unidade e escala",
    text: "Comparar unidades nativas, zeros persistentes, picos extremos e cobertura mínima antes da publicação."
  },
  {
    label: "4. Publicação pedagógica",
    text: "Entrar na UI apenas como dado observado, dado processado ou hipótese interpretativa, sem misturar camadas."
  }
];

const PUBLIC_SOURCES = [
  {
    label: "SIGQAr / AQMIS",
    href: "https://fat.ei.weblakes.com/INEA/",
    detail: "Portal público do Sistema Integrado de Gestão da Qualidade do Ar."
  },
  {
    label: "Dados abertos do portal",
    href: "/data/air/manifest.json",
    detail: "Manifesto local dos CSVs publicados pelo SEMEAR."
  },
  {
    label: "Relatório técnico desta rodada",
    href: "/reports/estado-da-nacao-radar-inea-organizacao-pesquisa-historica-20260610.md",
    detail: "Síntese de fontes, lacunas e roteiro seguro de scraping."
  }
];

export function RadarHistoricalResearchPanel() {
  return (
    <section id="pesquisa-historica" className="space-y-6 border-t border-slate-100 pt-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-black text-slate-800">Pesquisa histórica e lacunas de dados</h2>
          <RadarEvidenceBadge
            level="interpretive"
            label="Roteiro de coleta segura"
            detail="prioriza rastreabilidade antes de ampliar a série pública"
          />
        </div>
        <p className="max-w-4xl text-xs font-semibold leading-relaxed text-slate-500">
          O Radar já reúne séries históricas relevantes, mas nem todo poluente tem a mesma maturidade. A ampliação deve começar pela disponibilidade
          demonstrável no SIGQAr/AQMIS, passar por cache local e só depois virar visualização pública.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {COVERAGE_LAYERS.map((item) => (
          <div
            key={item.title}
            className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.35)]"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{item.status}</div>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{item.title}</h3>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">{item.range}</div>
            <p className="mt-3 text-[11px] font-semibold leading-relaxed text-slate-600">{item.detail}</p>
            <div className="mt-4">
              <RadarEvidenceBadge level={item.tone} label={item.status} detail={item.range} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.45)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Pipeline recomendado</div>
          <h3 className="mt-2 text-base font-black text-slate-900">Como aprofundar scraping histórico sem fragilizar o Radar</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {RESEARCH_STEPS.map((step) => (
              <div key={step.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{step.label}</div>
                <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-700">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-emerald-200 bg-[linear-gradient(180deg,#ecfdf5,#ffffff)] p-5 shadow-[0_20px_45px_-34px_rgba(16,185,129,0.45)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Fontes e auditoria</div>
          <h3 className="mt-2 text-base font-black text-slate-900">Onde conferir a origem</h3>
          <div className="mt-4 space-y-3">
            {PUBLIC_SOURCES.map((source) => (
              <a
                key={source.label}
                href={source.href}
                target={source.href.startsWith("http") ? "_blank" : undefined}
                rel={source.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block rounded-2xl border border-emerald-200 bg-white p-4 text-slate-800 transition-colors hover:bg-emerald-50"
              >
                <div className="text-xs font-black">{source.label}</div>
                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-600">{source.detail}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <RadarVisualNotice
        type="info"
        title="Princípio de publicação"
        description="Nova raspagem histórica só deve virar interface quando houver disponibilidade amostral, unidade esperada, cobertura mínima e relatório de auditoria. O que não passar por esses filtros permanece como pesquisa, não como dado público consolidado."
      />
    </section>
  );
}
