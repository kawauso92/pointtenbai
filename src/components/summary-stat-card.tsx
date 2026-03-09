import { formatCurrency } from "@/lib/utils";

type SummaryStatCardProps = {
  label: string;
  value: number | string;
  tone?: "default" | "success" | "muted" | "warning";
  kind?: "number" | "currency";
  note?: string;
  className?: string;
};

const toneClassMap: Record<NonNullable<SummaryStatCardProps["tone"]>, string> = {
  default: "border-border-theme bg-surface text-ink",
  success: "border-profit/20 bg-profit-bg text-ink",
  muted: "border-muted/20 bg-muted-bg text-ink",
  warning: "border-prospect/20 bg-prospect-bg text-ink",
};

export function SummaryStatCard({
  label,
  value,
  tone = "default",
  kind = "number",
  note,
  className = "",
}: SummaryStatCardProps) {
  const renderedValue = kind === "currency" && typeof value === "number" ? formatCurrency(value) : value;

  return (
    <div className={`min-h-[104px] rounded-[24px] border px-4 py-3 shadow-sm ${toneClassMap[tone]} ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-sub">{label}</p>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight">{renderedValue}</p>
      {note ? <p className="mt-2 text-[11px] text-ink-sub">{note}</p> : null}
    </div>
  );
}
