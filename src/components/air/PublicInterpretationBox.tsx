import { IconShell, SurfaceCard } from "../BrandSystem";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE } from "../../data/air/radar-copy";
import { useRadarReleaseMetadata } from "../../data/air/useRadarReleaseMetadata";
import { RadarEvidenceStateBlock } from "../../pages/air/radar/RadarEvidenceStateBlock";

export function PublicInterpretationBox() {
  const releaseMetadata = useRadarReleaseMetadata();

  return (
    <SurfaceCard className="border border-amber-200 bg-amber-50/50 p-6 rounded-2xl transition-all shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <IconShell tone="warm" className="shrink-0">
          <svg className="h-6 w-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </IconShell>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wider">
              Como Interpretar estes Achados Cidadãos?
            </h3>
            <span className="rounded-full border border-amber-300 bg-white/70 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-900">
              ciclo {releaseMetadata.cycleVersion}
            </span>
            <span className="rounded-full border border-amber-300 bg-amber-100/80 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-amber-900">
              metodologia {releaseMetadata.methodologyVersion}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white/70 px-3 py-1 text-[10px] font-black text-amber-900">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="uppercase tracking-[0.16em]">Leitura pública de atenção</span>
            <span className="hidden font-semibold normal-case text-amber-800/80 md:inline">use este quadro para cobrança cívica, não como substituto de perícia ou laudo causal</span>
          </div>
          <div className="text-xs leading-relaxed text-amber-800 space-y-3 font-medium">
            <p>
              A análise da qualidade do ar em Volta Redonda baseia-se em <strong>dados oficiais processados</strong> oriundos do INEA. 
              Ao ler estes relatórios, é muito importante adotar uma postura de honestidade intelectual e rigor científico:
            </p>
            <ul className="list-disc pl-4 space-y-2">
              <li>
                <strong>Sinal de Atenção, Não Prova Judicial:</strong> Quando uma estação aparece muitas vezes com classificação de qualidade MODERADA ou pior, isso <em>não significa automaticamente um indício de crime ambiental</em> ou prova de ilegalidade. Significa que aquela região apresenta um <strong>sinal de atenção</strong> contínuo que demanda investigação técnica detalhada e esclarecimento das autoridades.
              </li>
              <li>
                <strong>Valores do Índice, Não Massa Física:</strong> O Radar do Ar exibe a <strong>classificação oficial do índice</strong> IQAr (subíndices adimensionais), não a concentração física de poluentes de forma direta (microgramas por metro cúbico). Um índice elevado reflete o cruzamento estatístico da medição com faixas regulamentares oficiais.
              </li>
              <li>
                <strong>Território como Prioridade, Não Sentença:</strong> Quando um bairro, setor ou equipamento social aparece como prioritário, isso significa que ele merece mais monitoramento, prevenção e resposta pública. Não significa que todos os moradores sofreram o mesmo nível de exposição nem que já exista nexo causal individual demonstrado.
              </li>
              <li>
                <strong>Monitoramento Batch:</strong> Lembre-se de que os dados são processados a partir de planilhas públicas atualizadas periodicamente pelo INEA, não representando fluxo contínuo minuto a minuto.
              </li>
              <li>
                <strong>Ação Social e Fiscalização Cidadã:</strong> Use estes <strong>indícios públicos</strong> para cobrar transparência e monitoramento mais capilarizado, fortalecendo a participação comunitária na defesa da saúde ambiental de Volta Redonda.
              </li>
            </ul>
          </div>
          <RadarEvidenceStateBlock
            state="partial"
            title="Prova parcial"
            description={`Este quadro serve para leitura pública, cobrança e priorização territorial dentro do release ${releaseMetadata.cycleVersion}, mas não substitui laudo causal, perícia ambiental ou ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE}.`}
          />
        </div>
      </div>
    </SurfaceCard>
  );
}
