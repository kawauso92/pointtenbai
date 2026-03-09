import { ConfigurationNotice } from "@/components/configuration-notice";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { SummaryStatCard } from "@/components/summary-stat-card";
import { computeDashboardMetrics } from "@/lib/analytics";
import { getDashboardPageData } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

type CategoryCardProps = {
  label: string;
  actual: number;
  estimated: number;
};

function CategoryCard({ label, actual, estimated }: CategoryCardProps) {
  const total = actual + estimated;

  return (
    <div className="rounded-[26px] border border-black/5 bg-white/88 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{label}</p>
          <p className="mt-3 text-xs text-ink/52">実利益</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-emerald-700">{formatCurrency(actual)}</p>
        </div>
        <p className="rounded-full bg-canvas/80 px-3 py-1 text-[11px] font-medium text-ink/55">合計 {formatCurrency(total)}</p>
      </div>
      <div className="mt-4 rounded-[20px] border border-amber-100 bg-amber-50/75 px-4 py-3">
        <p className="text-xs text-ink/52">見込み</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-amber-700">{formatCurrency(estimated)}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const data = await getDashboardPageData();
  const metrics = computeDashboardMetrics(data);
  const monthlyRows = [...metrics.monthlyRows].sort((left, right) => left.monthKey.localeCompare(right.monthKey));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Dashboard"
        title="利益ダッシュボード"
        description={`${metrics.currentYear}年の実利益と見込みを、カテゴリ別の内訳と月次の流れで俯瞰できる形に整理しています。`}
      />

      {!data.isConfigured ? <ConfigurationNotice /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <SummaryStatCard
          label="実利益"
          value={metrics.yearActualTotal}
          kind="currency"
          tone="success"
          note={`${metrics.currentYear}年累計`}
          className="min-h-[120px]"
        />
        <SummaryStatCard
          label="見込み"
          value={metrics.yearEstimatedTotal}
          kind="currency"
          tone="warning"
          note={`${metrics.currentYear}年累計`}
          className="min-h-[120px]"
        />
      </div>

      <SectionCard title="カテゴリ別内訳" description="全体の利益を、ポイ活 / 転売 / 回線の3カテゴリに分けて確認します。">
        <div className="grid gap-3 md:grid-cols-3">
          <CategoryCard label="ポイ活" actual={metrics.categories.point.actual} estimated={metrics.categories.point.estimated} />
          <CategoryCard label="転売" actual={metrics.categories.resale.actual} estimated={metrics.categories.resale.estimated} />
          <CategoryCard label="回線" actual={metrics.categories.mobile.actual} estimated={metrics.categories.mobile.estimated} />
        </div>
      </SectionCard>

      <SectionCard title="月別利益" description="1月から12月までを俯瞰し、実利益と見込みの流れをひと目で追えるようにしています。">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {monthlyRows.map((row) => {
            const total = row.actual + row.estimated;
            const hasValue = total !== 0 || row.actual !== 0 || row.estimated !== 0;

            return (
              <div
                key={row.monthKey}
                className={[
                  "rounded-[24px] border p-4 transition-colors",
                  hasValue ? "border-black/5 bg-white/88 shadow-sm" : "border-black/5 bg-slate-50/60 text-ink/45",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent/80">{row.monthKey}</p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight">{row.label}</h3>
                  </div>
                  <p className="rounded-full bg-canvas/70 px-2.5 py-1 text-[11px] font-medium text-ink/55">合計 {formatCurrency(total)}</p>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-[18px] border border-emerald-100 bg-emerald-50/75 px-3.5 py-3">
                    <p className="text-[11px] font-medium text-ink/55">実利益</p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-emerald-700">{formatCurrency(row.actual)}</p>
                  </div>
                  <div className="rounded-[18px] border border-amber-100 bg-amber-50/75 px-3.5 py-3">
                    <p className="text-[11px] font-medium text-ink/55">見込み</p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-amber-700">{formatCurrency(row.estimated)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-ink/62">
                  <div className="flex items-center justify-between rounded-2xl bg-canvas/65 px-3 py-2">
                    <span>ポイ活</span>
                    <span>実 {formatCurrency(row.pointActual)} / 見 {formatCurrency(row.pointEstimated)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-canvas/65 px-3 py-2">
                    <span>転売</span>
                    <span>実 {formatCurrency(row.resaleActual)} / 見 {formatCurrency(row.resaleEstimated)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-canvas/65 px-3 py-2">
                    <span>回線</span>
                    <span>実 {formatCurrency(row.mobileActual)} / 見 {formatCurrency(row.mobileEstimated)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
