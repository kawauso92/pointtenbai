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
    <section className={`rounded-[20px] border border-border-theme bg-surface/95 p-3 shadow-panel backdrop-blur md:rounded-[28px] md:p-5 ${className}`}>
      {title || description || action ? (
        <div className="mb-2.5 flex flex-col gap-2 md:mb-4 md:gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            {title ? <h3 className="text-[14px] font-semibold leading-tight tracking-tight md:text-lg">{title}</h3> : null}
            {description ? <p className="mt-0.5 text-[12px] leading-[1.15rem] text-ink-sub md:mt-1 md:text-sm md:leading-6">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
