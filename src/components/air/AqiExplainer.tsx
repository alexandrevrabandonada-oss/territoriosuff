import { SurfaceCard } from "../BrandSystem";
import { getIneaClassificationStyle } from "../../pages/air/IneaRadarPage";
import { RADAR_EXPERIMENTAL_COMPARISON_NOTE } from "../../data/air/radar-copy";
import { useRadarReleaseMetadata } from "../../data/air/useRadarReleaseMetadata";
import { RadarEvidenceStateBlock } from "../../pages/air/radar/RadarEvidenceStateBlock";

interface ClassificationDetail {
  name: string;
  range: string;
  description: string;
  effect: string;
}

const CLASSIFICATIONS: ClassificationDetail[] = [
  {
    name: "BOA",
    range: "0 - 40",
    description: "Qualidade do ar considerada satisfatória, apresentando pouco ou nenhum risco à saúde.",
    effect: "Em geral, não se esperam efeitos relevantes para a população geral."
  },
  {
    name: "MODERADA",
    range: "41 - 80",
    description: "Qualidade do ar aceitável. No entanto, alguns poluentes podem causar preocupação moderada de saúde para um grupo muito pequeno de pessoas.",
    effect: "Pessoas de grupos sensíveis (crianças, idosos e pessoas com doenças respiratórias ou cardíacas) podem apresentar sintomas leves."
  },
  {
    name: "RUIM",
    range: "81 - 120",
    description: "Qualidade do ar que pode começar a provocar efeitos na saúde do público geral. Grupos sensíveis podem sofrer efeitos mais sérios.",
    effect: "Toda a população pode começar a sentir efeitos como tosse seca e cansaço. Grupos de risco devem reduzir esforço físico pesado ao ar livre."
  },
  {
    name: "MUITO RUIM",
    range: "121 - 200",
    description: "Condições consideradas insalubres. A população geral tem maior probabilidade de ser afetada.",
    effect: "Agravamento de sintomas respiratórios e cardiovasculares. Toda a população deve evitar atividades físicas intensas ao ar livre."
  },
  {
    name: "PÉSSIMA",
    range: "200+",
    description: "Classificação de alerta de saúde de emergência. Toda a população é propensa a ser afetada por complicações sérias.",
    effect: "Efeitos graves sobre a saúde de toda a população. Recomenda-se a suspensão de atividades ao ar livre para todos."
  }
];

export function AqiExplainer() {
  const releaseMetadata = useRadarReleaseMetadata();

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-5 md:p-6 bg-white border border-slate-100 rounded-2xl space-y-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
              Como ler o Índice IQAr
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
              ciclo {releaseMetadata.cycleVersion}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
              metodologia {releaseMetadata.methodologyVersion}
            </span>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800">
              camada normativa
            </span>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-1.5 md:col-span-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">O que é o IQAr?</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              O Índice de Qualidade do Ar (IQAr) é um indicador processado que converte concentrações complexas de múltiplos gases e partículas em uma escala simples de ler. Em vez de analisar microgramas por metro cúbico diretamente, o público lê uma nota unificada que varia de BOA a PÉSSIMA.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              No release {releaseMetadata.cycleVersion}, isso significa que o Radar comunica a régua oficial publicada pelo INEA para classificação pública. O índice facilita entendimento cívico, mas não substitui a leitura da concentração bruta quando a pergunta exige física do poluente, dose ou comparação laboratorial.
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Como funciona:</h4>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1 font-semibold">
              <li><strong>Subíndices:</strong> Cada poluente recebe uma nota individual chamada subíndice.</li>
              <li><strong>Poluente Controlador:</strong> O poluente que tiver o pior subíndice (nota mais alta) define a nota final do IQAr daquele período.</li>
            </ul>
          </div>
        </div>

        <RadarEvidenceStateBlock
          state="published"
          title="Régua oficial publicada"
          description={`A explicação do IQAr e de suas faixas é uma camada normativa publicada e estável dentro do release ${releaseMetadata.cycleVersion}. O que continua parcial não é a regra do índice em si, mas a força de cada leitura empírica quando faltam cobertura homogênea ou quando ${RADAR_EXPERIMENTAL_COMPARISON_NOTE.toLowerCase()}`}
        />
      </SurfaceCard>

      {/* Classifications cards list */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
          Faixas e Efeitos de Classificação Oficial do INEA
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CLASSIFICATIONS.map((c) => {
            const style = getIneaClassificationStyle(c.name);
            return (
              <SurfaceCard
                key={c.name}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs ${style}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-black tracking-tight">{c.name}</strong>
                    <span className="text-[10px] font-black opacity-75">{c.range}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed font-bold opacity-90">
                    {c.description}
                  </p>
                </div>
                <div className="border-t border-current/10 pt-2 mt-3 text-[9px] font-semibold italic opacity-80">
                  {c.effect}
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      </div>

      <RadarEvidenceStateBlock
        state="partial"
        title="Faixas explicam a régua, não fecham causalidade"
        description={`As categorias BOA a PÉSSIMA ajudam a interpretar o índice oficial e orientar comunicação pública no release ${releaseMetadata.cycleVersion}. Elas não bastam, sozinhas, para inferir origem emissora específica, exposição individual ou dano sanitário localizado sem contexto adicional.`}
      />
    </div>
  );
}
