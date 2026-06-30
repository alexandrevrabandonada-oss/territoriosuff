import { getEvidenceStateLabel, RadarEvidenceStateBlock } from "./RadarEvidenceStateBlock";
import { RADAR_OFFICIAL_RECORD_QAQC_NOTE } from "../../../data/air/radar-copy";

type RoadmapStatus = "published" | "in_progress" | "pending";

function getStatusTone(status: RoadmapStatus) {
  switch (status) {
    case "published":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
        card: "border-emerald-200 bg-emerald-50/70"
      };
    case "in_progress":
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

const ROADMAP_ITEMS: Array<{
  title: string;
  status: RoadmapStatus;
  objective: string;
  evidence: string;
  publicImpact: string;
  evidenceState: "published" | "partial" | "missing" | "external";
}> = [
  {
    title: "Manifesto e exportação reproduzível",
    status: "published",
    objective: "Garantir que terceiros possam refazer a auditoria fora da interface visual.",
    evidence: "Manifesto público, CSV bruto, catálogo de partições e contratos de API validados.",
    publicImpact: "Jornalismo, pesquisa e controle social deixam de depender de print ou narrativa do portal.",
    evidenceState: "published"
  },
  {
    title: "Metadados operacionais completos",
    status: "in_progress",
    objective: "Substituir inferência controlada por janela operacional explícita para toda a malha.",
    evidence: "Fonte operacional publicada por estação, com datas de operação e regra de cobertura rastreável.",
    publicImpact: "Aumenta a defensabilidade de séries, rankings e lacunas sem reconstrução editorial.",
    evidenceState: "partial"
  },
  {
    title: RADAR_OFFICIAL_RECORD_QAQC_NOTE,
    status: "pending",
    objective: "Diferenciar leitura observada, leitura validada e anomalia instrumental no nível do registro.",
    evidence: "Flags oficiais por observação, documentação pública da cadeia de validação e revisão histórica versionada.",
    publicImpact: "Eleva o Radar de transparência forte para referência regulatória comparável internacionalmente.",
    evidenceState: "missing"
  },
  {
    title: "Resposta institucional rastreável",
    status: "pending",
    objective: "Vincular cobrança pública a resposta do órgão e evidência de providência tomada.",
    evidence: "Painel de follow-up com pedidos LAI, manutenção, expansão da rede e publicação de resposta oficial.",
    publicImpact: "Transforma transparência em accountability observável, não apenas em exposição de dados.",
    evidenceState: "missing"
  }
];

export function RadarTransparencyRoadmap() {
  return (
    <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]">
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Roadmap de transparência</div>
        <h3 className="text-lg font-black tracking-tight text-slate-900">Compromissos públicos para o Radar virar referência internacional</h3>
        <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
          Cada etapa abaixo define o que ainda precisa ser publicado, qual evidência documenta a entrega e qual ganho real isso traz para a auditoria pública.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {ROADMAP_ITEMS.map((item) => {
          const tone = getStatusTone(item.status);
          return (
            <article key={item.title} className={`rounded-[1.6rem] border p-5 ${tone.card}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h4 className="text-base font-black tracking-tight text-slate-900">{item.title}</h4>
                <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${tone.badge}`}>
                  {item.status === "published" ? "publicado" : item.status === "in_progress" ? "em andamento" : "pendente"}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-[11px] font-semibold leading-relaxed text-slate-700">
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Objetivo</span>
                  <p className="mt-1">{item.objective}</p>
                </div>
                <div>
                  <RadarEvidenceStateBlock
                    state={item.evidenceState}
                    title={getEvidenceStateLabel(item.evidenceState)}
                    description={item.evidence}
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Impacto público</span>
                  <p className="mt-1">{item.publicImpact}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
