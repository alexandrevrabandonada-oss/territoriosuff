import type { ReactNode, ComponentPropsWithoutRef } from "react";

type SurfaceCardProps = ComponentPropsWithoutRef<"div">;

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

type IconShellProps = {
  children: ReactNode;
  tone?: "seed" | "lab" | "brand" | "neutral" | "warm";
  className?: string;
};

type ChipProps = {
  children: ReactNode;
  tone?: "default" | "active" | "seed" | "lab";
  className?: string;
};

type EditorialCardVariant = "standard" | "featured" | "compact" | "text" | "media";
type EditorialCardTone = "editorial" | "featured" | "tecnico" | "documental" | "dados" | "acervo" | "timeline" | "dossie" | "corredor" | "blog" | "relatorio";

type EditorialCardProps = {
  children: ReactNode;
  className?: string;
  variant?: EditorialCardVariant;
  tone?: EditorialCardTone;
};

const iconToneClasses: Record<NonNullable<IconShellProps["tone"]>, string> = {
  seed: "bg-accent-seed/10 text-accent-seed",
  lab: "bg-accent-lab/10 text-accent-lab",
  brand: "bg-brand-primary-soft text-brand-primary",
  neutral: "bg-surface-2 text-text-primary",
  warm: "bg-accent-yellow/10 text-accent-brown"
};

const chipToneClasses: Record<NonNullable<ChipProps["tone"]>, string> = {
  default: "border-border-subtle bg-surface-2 text-text-secondary",
  active: "border-brand-primary/15 bg-brand-primary-soft text-brand-primary-dark",
  seed: "border-accent-seed/20 bg-accent-seed/10 text-accent-seed",
  lab: "border-accent-lab/20 bg-accent-lab/10 text-accent-lab"
};

export function SurfaceCard({ children, className = "", ...props }: SurfaceCardProps) {
  return <div {...props} className={`surface-card motion-surface motion-surface-hover flex flex-col ${className}`.trim()}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="space-y-3.5">
      <div className="section-header-shell semear-seed-wave">
        <div className="flex flex-col gap-2.5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="section-badge">{eyebrow}</span>
              <span className="semear-core-disc h-6 w-6" aria-hidden="true" />
            </div>
          <h2 className="max-w-3xl text-2xl font-black leading-[1.1] tracking-tight text-text-primary md:text-3xl">{title}</h2>
          {description ? <p className="max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0 motion-control md:pt-1">{action}</div> : null}
        </div>
      </div>
      <div className="decorative-divider" aria-hidden="true" />
    </div>
  );
}

export function IconShell({ children, tone = "brand", className = "" }: IconShellProps) {
  return <div className={`ui-icon-shell ${iconToneClasses[tone]} ${className}`.trim()}>{children}</div>;
}

export function Chip({ children, tone = "default", className = "" }: ChipProps) {
  return <span className={`ui-chip leading-none ${chipToneClasses[tone]} ${className}`.trim()}>{children}</span>;
}

const editorialCardVariantClasses: Record<EditorialCardVariant, string> = {
  standard: "min-h-[22rem]",
  featured: "min-h-[28rem]",
  compact: "min-h-[13rem]",
  text: "min-h-[12rem]",
  media: "min-h-[18rem]"
};

const editorialCardToneClasses: Record<EditorialCardTone, string> = {
  editorial: "semear-card-editorial",
  featured: "semear-card-featured",
  tecnico: "semear-card-tecnico",
  documental: "semear-card-documental",
  dados:      "axis-card-dados",
  acervo:     "axis-card-acervo",
  timeline:   "axis-card-timeline",
  dossie:     "axis-card-dossie",
  corredor:   "axis-card-corredor",
  blog:       "axis-card-blog",
  relatorio:  "axis-card-relatorio",
};

export function EditorialCard({ children, className = "", variant = "standard", tone = "editorial" }: EditorialCardProps) {
  return (
    <article
      className={`semear-card ${editorialCardToneClasses[tone]} motion-surface motion-surface-hover flex h-full flex-col overflow-hidden ${editorialCardVariantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </article>
  );
}

export function EditorialCardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-1 flex-col gap-3.5 p-4 md:p-5 ${className}`.trim()}>{children}</div>;
}

export function EditorialCardEyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`ui-chip-editorial w-fit ${className}`.trim()}>{children}</span>;
}

export function EditorialCardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-xl font-black leading-[1.1] tracking-tight text-text-primary md:text-[1.35rem] ${className}`.trim()}>{children}</h3>;
}

export function EditorialCardExcerpt({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm leading-relaxed text-text-secondary ${className}`.trim()}>{children}</p>;
}

export function EditorialCardMeta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-text-secondary ${className}`.trim()}>{children}</div>;
}

export function EditorialCardActions({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mt-auto flex flex-wrap items-center gap-2.5 pt-1 ${className}`.trim()}>{children}</div>;
}
