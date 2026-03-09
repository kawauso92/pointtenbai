type StatusBadgeProps = {
  tone?: "neutral" | "success" | "muted" | "warning";
  children: string;
};

const toneClassMap: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  neutral: "border border-accent/20 bg-accent-bg text-accent",
  success: "border border-profit/20 bg-profit-bg text-profit",
  muted: "border border-muted/20 bg-muted-bg text-muted",
  warning: "border border-prospect/20 bg-prospect-bg text-prospect",
};

export function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em] ${toneClassMap[tone]}`}>
      {children}
    </span>
  );
}
