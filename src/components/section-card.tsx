import type { PropsWithChildren, ReactNode } from "react";

type SectionCardProps = PropsWithChildren<{
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}>;

export function SectionCard({
  title,
  description,
  action,
  className = "",
  children,
}: SectionCardProps) {
  return (
    <section className={`rounded-[28px] border border-border-theme bg-surface/95 p-4 shadow-panel backdrop-blur md:p-5 ${className}`}>
      {title || description || action ? (
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {title ? <h3 className="text-base font-semibold tracking-tight md:text-lg">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-ink-sub">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
