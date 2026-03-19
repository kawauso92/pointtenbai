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
    <section className={`rounded-[20px] border border-border-theme bg-surface/95 p-3.5 shadow-panel backdrop-blur md:rounded-[24px] md:p-4 ${className}`}>
      {title || description || action ? (
        <div className="mb-3 flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {title ? <h3 className="text-[15px] font-semibold tracking-tight md:text-base">{title}</h3> : null}
            {description ? <p className="mt-1 text-[13px] leading-5 text-ink-sub md:text-sm">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
