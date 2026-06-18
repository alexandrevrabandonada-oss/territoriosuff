import { Link } from "react-router-dom";
import { getEvidenceStateLabel, RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE } from "../../../data/air/radar-copy";

type ImplementationState = "completed" | "active" | "queued";

function getImplementationTone(state: ImplementationState) {
  switch (state) {
    case "completed":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
        card: "border-emerald-200 bg-emerald-50/70"
      };
    case "active":
      return {
        badge: "border-sky-200 bg-sky-50 text-sky-800",
        card: "border-sky-200 bg-sky-50/70"
      };
    default:
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-900",
        card: "border-amber-200 bg-amber-50/70"
      };
  }
}

const IMPLEMENTATION_ITEMS: Array<{
  title: string;
  state: ImplementationState;
  referenceDate: string;
  delivery: string;
  closeCriteria: string;
  evidence: string;
  evidenceState: "published" | "partial" | "missing" | "external";
  missingEvidence?: {
    title: string;
    description: string;
  };
  proofs: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
}> = [
  {
    title: "Exportação aberta reproduzível",
    state: "completed",
    referenceDate: "16/06/2026",
    delivery: "Manifesto, exportação CSV, catálogo de partições e contratos públicos validados.",
    closeCriteria: "Ter rotas públicas estáveis e documentação legível por máquina publicada.",
    evidence: "Manifesto da API, export-catalog, export bruto e suíte `inea:qa:public-contract`.",
    evidenceState: "published",
    proofs: [
      { label: "Abrir manifesto", href: "/api/air/inea/export-manifest", external: true },
      { label: "Ver catálogo", href: "/api/air/inea/export-catalog", external: true },
      { label: "Baixar CSV bruto", href: "/api/air/inea/export?metricType=GENERAL_AQI", external: true }
    ]
  },
  {
    title: "Metadados operacionais por estação",
    state: "active",
    referenceDate: "16/06/2026",
    delivery: "Janela operacional, fonte e rastreabilidade editorial por estação já expostas ao público.",
    closeCriteria: "Toda estação operar com metadata explícita, sem dependência de inferência para cobertura principal.",
    evidence: "Endpoint `stations-metadata`, cartões de confiança e snapshot metodológico.",
    evidenceState: "partial",
    proofs: [
      { label: "Abrir metadados", href: "/api/air/inea/stations-metadata", external: true },
      { label: "Ver metodologia", href: "/qualidade-ar/inea/metodologia" },
      { label: "Auditoria técnica", href: "/reports/estado-da-nacao-radar-inea-fontes-historicas-metodologia-20260610.md", external: true }
    ]
  },
  {
    title: RADAR_EXPERIMENTAL_OBSERVATION_NOTE,
    state: "queued",
    referenceDate: "Próxima fase",
    delivery: "Flags de qualidade por registro e histórico de revisão metodológica pública.",
    closeCriteria: "Cada observação poder ser distinguida como observada, validada, revista ou descartada.",
    evidence: "Publicação de flags oficiais e changelog técnico versionado por release.",
    evidenceState: "missing",
    missingEvidence: {
      title: "Evidência ainda não publicada",
      description: `Quando este marco avançar, aqui deve existir um artefato público com flags ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE} e histórico de revisão metodológica por release.`
    },
    proofs: [
      { label: "Base metodológica atual", href: "/qualidade-ar/inea/metodologia" },
      { label: "Auditoria do módulo", href: "/reports/estado-da-nacao-radar-inea-fontes-historicas-metodologia-20260610.md", external: true }
    ]
  },
  {
    title: "Accountability de resposta institucional",
    state: "queued",
    referenceDate: "Próxima fase",
    delivery: "Acompanhamento público de LAIs, manutenção, ampliação de rede e resposta do órgão.",
    closeCriteria: "Cada cobrança pública relevante possuir status, resposta e evidência de providência.",
    evidence: "Painel de follow-up institucional com datas, protocolo e link de resposta.",
    evidenceState: "missing",
    missingEvidence: {
      title: "Evidência ainda não publicada",
      description: "Quando este marco for entregue, aqui deve aparecer um painel com protocolo, data, resposta oficial e status atualizado de cada cobrança pública relevante."
    },
    proofs: [
      { label: "Ver metodologia", href: "/qualidade-ar/inea/metodologia" },
      { label: "Ir para dados", href: "/dados" }
    ]
  }
];

export function RadarImplementationStatus() {
  return (
    <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]">
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Status público de implementação</div>
        <h3 className="text-lg font-black tracking-tight text-slate-900">O que já foi entregue, o que está ativo e o que ainda precisa ser fechado</h3>
        <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
          Este painel transforma o roadmap em governança verificável. Cada marco mostra a data de referência, o critério de fechamento e a evidência pública esperada.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {IMPLEMENTATION_ITEMS.map((item) => {
          const tone = getImplementationTone(item.state);
          return (
            <article key={item.title} className={`rounded-[1.6rem] border p-5 ${tone.card}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Data de referência</div>
                  <div className="mt-1 text-[11px] font-black text-slate-900">{item.referenceDate}</div>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${tone.badge}`}>
                  {item.state === "completed" ? "entregue" : item.state === "active" ? "ativo" : "na fila"}
                </span>
              </div>

              <h4 className="mt-3 text-base font-black tracking-tight text-slate-900">{item.title}</h4>

              <div className="mt-4 space-y-3 text-[11px] font-semibold leading-relaxed text-slate-700">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Entrega</span>
                  <p className="mt-1">{item.delivery}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Critério de fechamento</span>
                  <p className="mt-1">{item.closeCriteria}</p>
                </div>
                <RadarEvidenceStateBlock
                  state={item.evidenceState}
                  title={getEvidenceStateLabel(item.evidenceState)}
                  description={item.evidence}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.proofs.map((proof) =>
                  proof.external ? (
                    <a
                      key={`${item.title}-${proof.label}`}
                      href={proof.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                    >
                      {proof.label}
                    </a>
                  ) : (
                    <Link
                      key={`${item.title}-${proof.label}`}
                      to={proof.href}
                      className="rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                    >
                      {proof.label}
                    </Link>
                  )
                )}
              </div>

              {item.missingEvidence && (
                <div className="mt-4">
                  <RadarEvidenceStateBlock
                    state="missing"
                    title="Prova ausente"
                    description={`${item.missingEvidence.title}. ${item.missingEvidence.description}`}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
