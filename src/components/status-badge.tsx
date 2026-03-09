type StatusBadgeProps = {
  tone?: "neutral" | "success" | "muted" | "warning";
  children: string;
};

const toneClassMap: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  neutral: "bg-sand/70 text-ink/75",
  success: "bg-emerald-100 text-emerald-800",
  muted: "bg-slate-200 text-slate-700",
  warning: "bg-amber-100 text-amber-800",
};

export function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] ${toneClassMap[tone]}`}>
      {children}
    </span>
  );
}