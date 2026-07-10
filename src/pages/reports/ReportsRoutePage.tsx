import { lazy, Suspense } from "react";

import { SurfaceCard } from "../../components/BrandSystem";
import { BrandTextureSkeleton } from "../../components/BrandMicro";
import { AxisEyebrow } from "../../components/AxisSystem";
import { PortalPageShell } from "../../components/portal";

const ReportsCatalog = lazy(() =>
  import("./ReportsListPage").then((module) => ({ default: module.ReportsListPage }))
);

export function ReportsRoutePage() {
  return (
    <PortalPageShell className="reports-stage">
      <SurfaceCard className="portal-stage-hero portal-stage-hero-documental overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <AxisEyebrow axis="relatorio">Biblioteca oficial</AxisEyebrow>
            <h1>Relatórios e boletins para controle social.</h1>
            <p>
              Uma base documental em PDF para consulta pública, memória técnica e acompanhamento institucional do projeto SEMEAR.
            </p>
          </div>
          <div className="portal-stage-stat">
            <span>PDF</span>
            <small>consulta pública e memória técnica</small>
          </div>
        </div>
      </SurfaceCard>

      <Suspense
        fallback={
          <SurfaceCard className="p-6" aria-live="polite" aria-busy="true">
            <span className="sr-only">Carregando catálogo de relatórios</span>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <BrandTextureSkeleton key={index} className="h-52 rounded-[1.5rem]" lines={4} />
              ))}
            </div>
          </SurfaceCard>
        }
      >
        <ReportsCatalog />
      </Suspense>
    </PortalPageShell>
  );
}
