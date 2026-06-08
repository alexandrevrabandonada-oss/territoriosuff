import { SocialExposureMap } from "../../../components/air/SocialExposureMap";
import type { RadarComparisonTab, RadarMode } from "./RadarTypes";
import { RadarMicroguide } from "./RadarMicroguide";
import { RadarModeFooter } from "./RadarModeFooter";

interface RadarTerritoryModeProps {
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onTop: () => void;
  onScrollToSocialMap: () => void;
}

export function RadarTerritoryMode({ onNavigate, onTop, onScrollToSocialMap }: RadarTerritoryModeProps) {
  return (
    <div className="animate-fade-in space-y-8 rounded-[2.5rem] border border-[#0e344d] bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.16),transparent_24%),radial-gradient(circle_at_85%_18%,rgba(16,185,129,0.18),transparent_22%),linear-gradient(160deg,#041521_0%,#081e2d_30%,#0b2538_62%,#041521_100%)] p-6 pt-6 text-slate-100 shadow-[0_28px_80px_-30px_rgba(4,21,33,0.95)] md:p-8">
      <div className="space-y-4 border-b border-[#0d2e46] pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-200">
          Quem respira esse ar?
        </div>
        <h2 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
          Exposição social e
          <span className="mt-1 block text-emerald-300">vulnerabilidade territorial</span>
        </h2>
        <div className="text-[10px] font-black uppercase tracking-widest text-rose-455">
          EXPOSIÇÃO SOCIAL NÃO É RANKING DE BAIRROS. É FERRAMENTA DE PRIORIDADE PÚBLICA.
        </div>
        <p className="max-w-3xl text-sm font-medium text-slate-300">
          Cruzamento geográfico das emissões industriais e da qualidade do ar com a densidade populacional e os equipamentos de saúde e educação de Volta Redonda (Censo 2022).
        </p>
      </div>

      <RadarMicroguide
        whatYouSee="Mapa de vulnerabilidade social que sobrepõe setores censitários do Censo IBGE 2022, equipamentos públicos sensíveis (escolas, hospitais) e a mancha urbana."
        howToRead="Explore as camadas do mapa para ver quais áreas populosas e equipamentos públicos estão localizados mais próximos das fontes industriais e estações de medição."
        whyItMatters="Essencial para o planejamento cívico e de saúde pública, permitindo priorizar investimentos de infraestrutura verde e equipes de saúde da família nos bairros de maior exposição."
      />

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200/80">Leitura pública orientada</div>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-white">Onde pressão ambiental e população se cruzam</h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-300">
            Utilize as camadas interativas para analisar escolas, postos de saúde, setores censitários e a densidade de poeira nos territórios mais sensíveis.
          </p>
        </div>
        <div className="rounded-[2rem] border border-emerald-500/15 bg-emerald-500/[0.08] p-5 shadow-[0_22px_44px_-34px_rgba(16,185,129,0.95)]">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">Ação imediata</div>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-white">
            Abra o mapa territorial e use o recorte como base para priorização de saúde, arborização e fiscalização.
          </p>
          <button
            onClick={onScrollToSocialMap}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-xs font-black text-slate-950 shadow-[0_14px_30px_-18px_rgba(16,185,129,1)] transition-colors hover:bg-emerald-300"
          >
            Explorar territórios prioritários →
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div id="social-map-section" className="scroll-mt-32">
          <SocialExposureMap />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.8rem] border border-rose-400/15 bg-[linear-gradient(180deg,rgba(127,29,29,0.6),rgba(69,10,10,0.9))] p-5 shadow-[0_24px_46px_-34px_rgba(239,68,68,0.9)] transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-200">Grupo de Risco · Crianças</span>
              <h4 className="mt-3 text-base font-black text-white">Primeira Infância</h4>
            </div>
            <p className="mt-4 text-[12px] font-semibold leading-relaxed text-rose-50">
              Menores de 5 anos possuem sistema respiratório em desenvolvimento e maior frequência respiratória, potencializando a absorção de material particulado.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-rose-400/15 bg-[linear-gradient(180deg,rgba(91,33,182,0.45),rgba(69,10,10,0.9))] p-5 shadow-[0_24px_46px_-34px_rgba(127,29,29,0.85)] transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-200">Grupo de Risco · Idosos</span>
              <h4 className="mt-3 text-base font-black text-white">População 60+</h4>
            </div>
            <p className="mt-4 text-[12px] font-semibold leading-relaxed text-rose-50">
              A senescência pulmonar combinada à exposição crônica a gases como SO₂ eleva as taxas de internação por complicações cardiorrespiratórias.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-rose-400/15 bg-[linear-gradient(180deg,rgba(30,41,59,0.45),rgba(69,10,10,0.88))] p-5 shadow-[0_24px_46px_-34px_rgba(127,29,29,0.85)] transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-rose-200">Equipamentos Sociais</span>
              <h4 className="mt-3 text-base font-black text-white">Escolas & UBS</h4>
            </div>
            <p className="mt-4 text-[12px] font-semibold leading-relaxed text-rose-50">
              Pontos de permanência prolongada que demandam cortinas vegetais de proteção e prioridade de monitoramento para garantir a integridade dos usuários.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(6,78,59,0.55),rgba(9,24,34,0.9))] p-5 shadow-[0_24px_46px_-34px_rgba(16,185,129,0.8)] transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-200">Dispersão Crônica</span>
              <h4 className="mt-3 text-base font-black text-white">Zonas de Influência</h4>
            </div>
            <p className="mt-4 text-[12px] font-semibold leading-relaxed text-emerald-50">
              Setores censitários adjacentes aos limites industriais sofrem impacto cumulativo de poeiras fugitivas devido à direção predominante dos ventos.
            </p>
          </div>
        </div>
      </div>

      <RadarModeFooter
        nextStep="Próximo passo recomendado: Consulte as coordenadas e status operacional das estações de Volta Redonda."
        primaryLabel="Ver Detalhes das Estações →"
        onPrimary={() => onNavigate("STATIONS")}
        onTop={onTop}
        dark
      />
    </div>
  );
}
