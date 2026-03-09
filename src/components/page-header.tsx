import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 rounded-[28px] border border-black/5 bg-white/80 p-5 shadow-panel backdrop-blur md:flex-row md:items-end md:justify-between md:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
        <h2 className="mt-2 text-[1.85rem] font-semibold tracking-tight md:text-[2.1rem]">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/62">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
