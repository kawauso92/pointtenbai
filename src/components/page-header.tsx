import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-3 flex flex-col gap-2 rounded-[20px] border border-border-theme bg-surface/95 p-3 shadow-panel backdrop-blur md:mb-5 md:flex-row md:items-end md:justify-between md:gap-4 md:rounded-[24px] md:p-6">
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-accent md:text-[11px] md:tracking-[0.24em]">{eyebrow}</p>
        <h2 className="mt-1 text-[1.34rem] font-semibold leading-tight tracking-tight md:mt-2 md:text-[2.1rem]">{title}</h2>
        <p className="mt-1 max-w-2xl text-[12px] leading-[1.15rem] text-ink-sub md:mt-2 md:max-w-3xl md:text-sm md:leading-6">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
