import { Chip, IconShell, SurfaceCard } from "../BrandSystem";
import type { GovernanceActor } from "../../content/programaUffTerritorio";

type GovernanceModelProps = {
  actors: GovernanceActor[];
};

function ActorIcon({ accent }: { accent: GovernanceActor["accent"] }) {
  if (accent === "seed") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 11c0-2.8 2.2-5 5-5s5 2.2 5 5v6H7v-6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6V3m-5 9H4m16 0h-3" />
      </svg>
    );
  }

  if (accent === "lab") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5h8M9 5v4l-4 8a2 2 0 001.8 3h10.4A2 2 0 0019 17l-4-8V5" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8l8-4 8 4-8 4-8-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 10v6m12-6v6M8 20h8" />
    </svg>
  );
}

export function GovernanceModel({ actors }: GovernanceModelProps) {
  const uffActor = actors.find((actor) => actor.badge === "UFF");
  const fecActor = actors.find((actor) => actor.badge === "FEC");
  const apsActor = actors.find((actor) => actor.badge === "APS");

  return (
    <div className="space-y-5">
      <SurfaceCard className="overflow-hidden rounded-[2rem] border-brand-primary/12 bg-gradient-to-br from-[#f6fbff] via-white to-[#fff8ee] p-5 md:p-7">
        <div className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary-dark">Arquitetura de governança</p>
            <h3 className="text-2xl font-black leading-tight text-text-primary md:text-3xl">Papéis distintos, execução integrada e presença territorial com lugar institucional claro</h3>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.2fr)_minmax(220px,0.9fr)] xl:items-center">
            <div className="space-y-4">
              {uffActor ? (
                <div key={uffActor.name} className="rounded-[1.5rem] border border-brand-primary/15 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <IconShell tone={uffActor.accent} className="h-11 w-11 rounded-2xl">
                      <ActorIcon accent={uffActor.accent} />
                    </IconShell>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">{uffActor.badge}</p>
                      <h4 className="text-lg font-black text-text-primary">{uffActor.name}</h4>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{uffActor.role}</p>
                </div>
              ) : null}
            </div>

            <div className="relative flex min-h-[280px] items-center justify-center">
              <div className="pointer-events-none absolute inset-0 hidden xl:block" aria-hidden="true">
                <div className="absolute left-1/2 top-1/2 h-px w-[78%] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
                <div className="absolute left-1/2 top-[18%] h-[64%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-brand-primary/20 to-transparent" />
              </div>
              <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-brand-primary/20 bg-[radial-gradient(circle_at_center,rgba(229,240,250,0.92),rgba(255,255,255,0.98)_58%,rgba(18,48,74,0.08))] shadow-[0_22px_50px_rgba(17,38,59,0.12)]">
                <div className="space-y-2 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary-dark">Núcleo do programa</p>
                  <h4 className="text-2xl font-black leading-tight text-text-primary">UFF + Território</h4>
                  <p className="mx-auto max-w-[18ch] text-sm leading-relaxed text-text-secondary">Coordenação acadêmica e científica, gestão executiva e coexecução territorial articuladas no mesmo desenho.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[fecActor, apsActor].filter((actor): actor is GovernanceActor => Boolean(actor)).map((actor) => (
                <div
                  key={actor.name}
                  className={[
                    "rounded-[1.5rem] border p-5 shadow-sm",
                    actor.accent === "seed" ? "border-accent-seed/20 bg-[#f8fbf1]" : "border-accent-lab/20 bg-[#eefcfb]"
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <IconShell tone={actor.accent} className="h-11 w-11 rounded-2xl">
                      <ActorIcon accent={actor.accent} />
                    </IconShell>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">{actor.badge}</p>
                      <h4 className="text-lg font-black text-text-primary">{actor.name}</h4>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{actor.role}</p>
                </div>
              ))}
            </div>
          </div>

          {apsActor ? (
            <div className="rounded-[1.75rem] border border-accent-seed/25 bg-[#f8fbf1] p-5 md:p-6">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Chip tone="seed">APS em destaque</Chip>
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-green">Coexecução territorial e comunitária</span>
                  </div>
                  <h4 className="text-2xl font-black leading-tight text-text-primary">A Associação Popular pela Sustentabilidade ocupa papel executivo central na presença territorial do programa</h4>
                  <p className="text-sm leading-relaxed text-text-secondary md:text-base">
                    A associação não aparece como apoio secundário. Ela é a coexecutora territorial e comunitária responsável por ativar relações, sustentar presença local e fazer com que as frentes saiam da estrutura institucional e cheguem ao território com continuidade.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-accent-seed/20 bg-white/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-green">Atuação territorial</p>
                    <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-text-primary">
                      <li className="flex gap-2.5"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-seed" aria-hidden="true" /><span>Mobilização territorial</span></li>
                      <li className="flex gap-2.5"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-seed" aria-hidden="true" /><span>Educação ambiental popular</span></li>
                      <li className="flex gap-2.5"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-seed" aria-hidden="true" /><span>Articulação com escolas, lideranças, coletivos e equipamentos públicos</span></li>
                    </ul>
                  </div>

                  <div className="rounded-[1.35rem] border border-accent-seed/20 bg-white/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-green">Atuação executiva</p>
                    <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-text-primary">
                      <li className="flex gap-2.5"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-seed" aria-hidden="true" /><span>Apoio à implementação dos pilotos</span></li>
                      <li className="flex gap-2.5"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-seed" aria-hidden="true" /><span>Devolutiva pública para comunidades e parceiros</span></li>
                      <li className="flex gap-2.5"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent-seed" aria-hidden="true" /><span>Coordenação executiva da frente de memória, cultura e incidência socioambiental</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </SurfaceCard>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="grid gap-4 md:grid-cols-3">
        {actors.map((actor) => (
          <SurfaceCard
            key={actor.name}
            className={[
              "rounded-[1.75rem] p-5 md:p-6",
              actor.accent === "seed" ? "border-accent-seed/20 bg-gradient-to-br from-[#f7fbef] via-white to-[#eef8db]" : "",
              actor.accent === "lab" ? "border-accent-lab/20 bg-gradient-to-br from-[#eefcfb] via-white to-[#e5f8f7]" : "",
              actor.accent === "brand" ? "border-brand-primary/15 bg-gradient-to-br from-brand-primary-soft/70 via-white to-surface-2" : ""
            ].join(" ")}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <IconShell tone={actor.accent} className="h-11 w-11 rounded-2xl">
                  <ActorIcon accent={actor.accent} />
                </IconShell>
                <Chip tone={actor.accent === "seed" ? "seed" : actor.accent === "lab" ? "lab" : "active"}>{actor.badge}</Chip>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black leading-tight text-text-primary">{actor.name}</h3>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-text-secondary">{actor.role}</p>
                <p className="text-sm leading-relaxed text-text-secondary">{actor.summary}</p>
              </div>

              <ul className="space-y-2 text-sm text-text-primary">
                {actor.highlights.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </SurfaceCard>
        ))}
      </div>

      <div className="space-y-4">
        <SurfaceCard className="rounded-[1.75rem] border-brand-primary/10 bg-gradient-to-br from-[#12304a] via-[#183b58] to-[#0f5b78] p-6 text-white md:p-7">
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Como o programa funciona</p>
            <h3 className="text-2xl font-black leading-tight">UFF coordena, FEC viabiliza e a APS coexecuta o território</h3>
            <p className="text-sm leading-relaxed text-white/80">
              A estrutura combina coordenação acadêmica e científica, gestão administrativa, financeira e contratual, e coexecução territorial e comunitária para reduzir a distância entre formulação, execução e presença pública no território.
            </p>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-[1.75rem] border-accent-seed/25 bg-[#f8fbf1] p-6 md:p-7">
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-green">Presença territorial com peso institucional</p>
            <h3 className="text-xl font-black text-text-primary">A Associação Popular pela Sustentabilidade é parte executiva do programa, não apoio periférico</h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              Sua atuação estrutura mobilização territorial, educação ambiental popular, articulação com redes locais, apoio aos pilotos, devolutiva pública e a coordenação executiva da frente de memória, cultura e incidência socioambiental.
            </p>
          </div>
        </SurfaceCard>
      </div>
      </div>
    </div>
  );
}