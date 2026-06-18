import { getEvidenceStateLabel, RadarEvidenceStateBlock, type EvidenceState } from "./RadarEvidenceStateBlock";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE } from "../../../data/air/radar-copy";

type EvidenceDictionaryItem = {
  state: EvidenceState;
  definition: string;
  whenToUse: string;
  example: string;
};

const EVIDENCE_ITEMS: EvidenceDictionaryItem[] = [
  {
    state: "published",
    definition: "O painel já se apoia em artefato público verificável, reproduzível e suficiente para auditoria independente direta.",
    whenToUse: "Use quando a base, a janela operacional ou a regra analítica já estão explicitamente publicadas.",
    example: "Exemplo no Radar: manifesto da API, catálogo de partições e bloco de lacunas/cobertura."
  },
  {
    state: "partial",
    definition: `A leitura já é útil e auditável em parte, mas ainda depende de inferência controlada, cobertura incompleta ou ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE}.`,
    whenToUse: "Use quando o painel já pode orientar triagem pública, mas ainda não sustenta conclusão forte sozinho.",
    example: "Exemplo no Radar: séries históricas comparativas, metadados operacionais incompletos e leitura territorial."
  },
  {
    state: "external",
    definition: "A sustentação atual vem de memória técnica, literatura, relatório externo ou trilha de pesquisa, não de camada operacional consolidada no portal.",
    whenToUse: "Use quando a referência ajuda a contextualizar, mas não deve ser tratada como dado operacional equivalente ao que está publicado no Radar.",
    example: "Exemplo no Radar: PTS como memória técnica em auditoria."
  },
  {
    state: "missing",
    definition: "Ainda não existe prova pública suficiente para liberar a leitura como camada confiável de uso operacional ou institucional.",
    whenToUse: "Use quando faltam artefatos mínimos de verificação, como QA/QC por observação, resposta institucional ou metadata crítica.",
    example: "Exemplo no Radar: NO₂ bloqueado operacionalmente e accountability institucional ainda não publicada."
  }
];

interface RadarEvidenceDictionaryProps {
  compact?: boolean;
}

export function RadarEvidenceDictionary({ compact = false }: RadarEvidenceDictionaryProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Dicionário de prova pública</div>
          <h3 className="text-lg font-black tracking-tight text-slate-900">
            {compact ? "Como o Radar nomeia a força da prova" : "Taxonomia operacional de prova para ler o Radar sem ambiguidade"}
          </h3>
          <p className="max-w-3xl text-[11px] font-semibold leading-relaxed text-slate-600">
            Estes quatro estados são a gramática oficial do Radar. Eles dizem se um painel já está pronto para auditoria forte, se ainda depende de cautela, se
            só possui memória externa ou se ainda não tem prova pública suficiente.
          </p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
          taxonomia única do módulo
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "lg:grid-cols-2" : "xl:grid-cols-4 md:grid-cols-2"}`}>
        {EVIDENCE_ITEMS.map((item) => (
          <div key={item.state} className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_14px_30px_-28px_rgba(15,23,42,0.3)]">
            <RadarEvidenceStateBlock state={item.state} title={getEvidenceStateLabel(item.state)} description={item.definition} />
            <div className="space-y-2 text-[11px] font-semibold leading-relaxed text-slate-600">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Quando usar</span>
                <p className="mt-1">{item.whenToUse}</p>
              </div>
              {!compact && (
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Exemplo no Radar</span>
                  <p className="mt-1">{item.example}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
