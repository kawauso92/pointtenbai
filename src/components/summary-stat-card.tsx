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
  default: "bg-white/88 text-ink",
  success: "bg-emerald-50 text-emerald-900",
  muted: "bg-slate-100 text-slate-800",
  warning: "bg-amber-50 text-amber-900",
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
    <div className={`min-h-[104px] rounded-[24px] border border-black/5 px-4 py-3 shadow-sm ${toneClassMap[tone]} ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-65">{label}</p>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight">{renderedValue}</p>
      {note ? <p className="mt-2 text-[11px] opacity-70">{note}</p> : null}
    </div>
  );
}