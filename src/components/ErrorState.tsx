import type { ReactNode } from "react";

import { Chip, IconShell, SurfaceCard } from "./BrandSystem";

type ErrorStateProps = {
  title?: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({
  title = "Não foi possível carregar esta seção",
  description,
  action
}: ErrorStateProps) {
  return (
    <SurfaceCard className="border-error/20 bg-error/5 p-6 text-center">
      <IconShell tone="neutral" className="mx-auto mb-3 rounded-full text-error">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </IconShell>
      <div className="mx-auto mb-3 flex justify-center">
        <Chip tone="lab">alerta institucional</Chip>
      </div>
      <h2 className="text-xl font-black text-text-primary">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </SurfaceCard>
  );
}
