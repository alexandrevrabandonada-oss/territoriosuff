import type { ComponentPropsWithoutRef, ReactNode } from "react";

type PortalPageShellProps = ComponentPropsWithoutRef<"section"> & {
  children: ReactNode;
};

export function PortalPageShell({ children, className = "", ...props }: PortalPageShellProps) {
  return (
    <section
      {...props}
      className={`portal-page-shell portal-stage space-y-8 md:space-y-10 ${className}`.trim()}
    >
      {children}
    </section>
  );
}
