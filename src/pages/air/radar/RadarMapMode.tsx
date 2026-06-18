import { Suspense, lazy } from "react";
import { SurfaceCard } from "../../../components/BrandSystem";
import { LoadingCard } from "../../../components/LoadingCard";
import { RADAR_EXPERIMENTAL_COMPARISON_NOTE } from "../../../data/air/radar-copy";
import { RadarNextReadingCard } from "./RadarNextReadingCard";
import type { RadarComparisonTab, RadarMode } from "./RadarTypes";
import { RadarMicroguide } from "./RadarMicroguide";
import { RadarModeFooter } from "./RadarModeFooter";

const AirAtlasMap = lazy(() =>
  import("../../../components/air/AirAtlasMap").then((module) => ({ default: module.AirAtlasMap })),
);

interface RadarMapModeProps {
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onTop: () => void;
}

export function RadarMapMode({ onNavigate, onTop }: RadarMapModeProps) {
  return (
    <div className="animate-fade-in space-y-8 pt-4">
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800">
          <span>🗺️ Onde o ar foi medido</span>
        </h2>
        <p className="text-sm font-medium text-slate-600">
          Localização geográfica das estações oficiais que compõem o monitoramento do INEA em Volta Redonda.
        </p>
        <p className="text-xs font-bold text-brand-primary">
          💡 Este modo responde: Onde estão localizadas as estações físicas e qual é a distribuição espacial da qualidade do ar pela cidade?
        </p>
      </div>

      <RadarMicroguide
        whatYouSee="Mapa interativo com a localização das estações de monitoramento e os status em comparação com a régua selecionada."
        howToRead="Clique em qualquer estação no mapa para ver seu painel de detalhes à direita (ou abaixo, no celular). Altere poluentes e réguas de comparação nos controles."
        whyItMatters="Permite identificar geograficamente os pontos de maior poluição e comparar se as concentrações estão dentro dos limites recomendados."
      />

      <div className="space-y-8">
        <Suspense fallback={<LoadingCard message="Carregando mapa interativo..." />}>
          <AirAtlasMap />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2">
          <SurfaceCard className="space-y-2.5 rounded-2xl border border-slate-100 bg-white/80 p-5 text-xs shadow-xs">
            <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#0e2c45]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              O que este mapa mostra
            </h4>
            <p className="font-semibold leading-relaxed text-slate-600">
              Este mapa mostra PM10 em 2024 a partir de dados horários públicos exibidos pela plataforma INEA/WebLakes. {RADAR_EXPERIMENTAL_COMPARISON_NOTE}
            </p>
          </SurfaceCard>

          <SurfaceCard className="space-y-2.5 rounded-2xl border border-slate-100 bg-white/80 p-5 text-xs shadow-xs">
            <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#0e2c45]">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Principais sinais de atenção
            </h4>
            <ul className="list-inside list-disc space-y-1 font-semibold leading-relaxed text-slate-600">
              <li>Belmonte teve a maior média anual de PM10.</li>
              <li>Retiro teve o maior número de dias acima da CONAMA 506.</li>
              <li>Santa Cecília teve menor média anual, mas ainda registrou eventos de atenção.</li>
            </ul>
          </SurfaceCard>
        </div>
      </div>

      <RadarNextReadingCard
        eyebrow="Próxima leitura recomendada"
        title="Agora confirme no tempo se o padrão espacial é persistente ou só um retrato pontual."
        description="O mapa orienta onde olhar. O histórico temporal mostra se o sinal aparece de forma recorrente, sazonal ou episódica, evitando conclusões apressadas baseadas em uma única fotografia espacial."
        caution="Distribuição no espaço sem confirmação temporal ainda não basta para afirmar padrão estável."
        primary={{ label: "Ir para histórico temporal", mode: "TIME", tab: "TREND" }}
        secondary={{ label: "Ver cobertura e silêncio", mode: "TIME", tab: "COVERAGE" }}
        onNavigate={onNavigate}
      />

      <RadarModeFooter
        nextStep="Próximo passo recomendado: Analise a evolução temporal no histórico e tendências."
        primaryLabel="Analisar Histórico Temporal →"
        onPrimary={() => onNavigate("TIME", "TREND")}
        onTop={onTop}
      />
    </div>
  );
}
