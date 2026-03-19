import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-3 flex flex-col gap-2.5 rounded-[20px] border border-border-theme bg-surface/95 p-3 shadow-panel backdrop-blur md:mb-4 md:flex-row md:items-end md:justify-between md:gap-3 md:rounded-[24px] md:p-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h2 className="mt-1 text-[1.4rem] font-semibold leading-tight tracking-tight md:text-[1.8rem]">{title}</h2>
        <p className="mt-1 max-w-3xl text-[13px] leading-5 text-ink-sub md:text-sm">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
