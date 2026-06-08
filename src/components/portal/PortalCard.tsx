import type { ComponentPropsWithoutRef, ReactNode } from "react";

type PortalCardVariant = "leitura" | "tecnico" | "alerta" | "social" | "acao" | "download" | "metodologia";

type PortalCardProps = ComponentPropsWithoutRef<"div"> & {
  variant?: PortalCardVariant;
  children: ReactNode;
};

const variantClassMap: Record<PortalCardVariant, string> = {
  leitura: "card-leitura",
  tecnico: "card-tecnico",
  alerta: "card-alerta",
  social: "card-social",
  acao: "card-acao",
  download: "portal-card-download",
  metodologia: "portal-card-methodology"
};

export function PortalCard({ variant = "leitura", className = "", children, ...props }: PortalCardProps) {
  return (
    <div
      {...props}
      className={`${variantClassMap[variant]} rounded-[1.8rem] p-5 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.45)] ${className}`.trim()}
    >
      {children}
    </div>
  );
}
