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
    <div className={`min-h-[80px] rounded-[18px] border px-3 py-2.5 shadow-sm md:min-h-[86px] md:rounded-[20px] md:px-3.5 md:py-3 ${toneClassMap[tone]} ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-sub">{label}</p>
      <p className="mt-1.5 text-[1.35rem] font-semibold leading-none tracking-tight md:mt-2 md:text-[26px]">{renderedValue}</p>
      {note ? <p className="mt-1 text-[10px] text-ink-sub">{note}</p> : null}
    </div>
  );
}
