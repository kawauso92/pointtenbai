"use client";

import { endOfMonth, format, parse } from "date-fns";
import { useState } from "react";
import { SectionCard } from "@/components/section-card";
import { SummaryStatCard } from "@/components/summary-stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  computeDashboardMetrics,
  getDashboardMonthKeys,
  resolveDashboardRange,
  type DashboardPeriodPreset,
} from "@/lib/analytics";
import type { MobileLineRow, PointActivityRow, ResaleTransactionRow } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

type DashboardOverviewProps = {
  pointActivities: PointActivityRow[];
  resaleTransactions: ResaleTransactionRow[];
  mobileLines: MobileLineRow[];
};

type CategoryCardProps = {
  label: string;
  actual: number;
  estimated: number;
};

const periodItems: Array<{ value: DashboardPeriodPreset; label: string }> = [
  { value: "thisYear", label: "今年" },
  { value: "thisMonth", label: "今月" },
  { value: "lastMonth", label: "先月" },
  { value: "last3Months", label: "直近3か月" },
  { value: "custom", label: "任意期間" },
];

function CategoryCard({ label, actual, estimated }: CategoryCardProps) {
  const total = actual + estimated;

  return (
    <div className="rounded-[24px] border border-border-theme bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{label}</p>
          <p className="mt-2 text-xs text-ink-sub">実利益</p>
        </div>
        <p className="rounded-full bg-surface-alt px-3 py-1 text-[11px] font-medium text-ink-sub">合計 {formatCurrency(total)}</p>
      </div>
      <div className="mt-3 grid gap-2 grid-cols-2">
        <div className="rounded-[18px] border border-profit/20 bg-profit-bg px-3 py-3">
          <p className="text-[11px] text-ink-sub">利益</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-profit">{formatCurrency(actual)}</p>
        </div>
        <div className="rounded-[18px] border border-prospect/20 bg-prospect-bg px-3 py-3">
          <p className="text-[11px] text-ink-sub">見込み</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-prospect">{formatCurrency(estimated)}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardOverview({ pointActivities, resaleTransactions, mobileLines }: DashboardOverviewProps) {
  const [preset, setPreset] = useState<DashboardPeriodPreset>("thisMonth");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const currentMonthKey = format(new Date(), "yyyy-MM");
  const [selectedMonthKey, setSelectedMonthKey] = useState(currentMonthKey);
  const range = resolveDashboardRange(preset, { from: customFrom, to: customTo });
  const metrics = computeDashboardMetrics(
    {
      pointActivities,
      resaleTransactions,
      mobileLines,
    },
    {
      from: range.from,
      to: range.to,
    },
  );
  const customRangeInvalid = preset === "custom" && (!customFrom || !customTo || customFrom > customTo);
  const monthKeys = Array.from(
    new Set([
      ...getDashboardMonthKeys({ pointActivities, resaleTransactions, mobileLines }),
      currentMonthKey,
      selectedMonthKey,
    ]),
  ).sort((left, right) => left.localeCompare(right));
  const currentMonthIndex = monthKeys.indexOf(selectedMonthKey);
  const selectedMonthDate = parse(`${selectedMonthKey}-01`, "yyyy-MM-dd", new Date());
  const selectedMonthLabel = format(selectedMonthDate, "yyyy年M月");
  const monthMetrics = computeDashboardMetrics(
    {
      pointActivities,
      resaleTransactions,
      mobileLines,
    },
    {
      from: `${selectedMonthKey}-01`,
      to: format(endOfMonth(selectedMonthDate), "yyyy-MM-dd"),
    },
  );
  const monthRow = monthMetrics.monthlyRows[0];

  return (
    <div className="space-y-4 md:space-y-5">
      <SectionCard title="期間フィルタ" description="ダッシュボード全体の集計期間を切り替えます。">
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {periodItems.map((item) => {
              const isActive = item.value === preset;

              return (
                <button
                  key={item.value}
                  type="button"
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? "bg-nav-active text-nav-active-text" : "bg-surface-alt text-ink-sub hover:bg-surface hover:text-ink"
                  }`}
                  onClick={() => setPreset(item.value)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {preset === "custom" ? (
            <div className="grid gap-3 md:grid-cols-[1fr,1fr,auto] md:items-end">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-ink">開始日</span>
                <Input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-ink">終了日</span>
                <Input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} />
              </label>
              <div className="rounded-2xl border border-border-theme bg-surface-alt/70 px-4 py-3 text-sm text-ink-sub">
                {customRangeInvalid ? "開始日と終了日を正しく指定してください。" : "指定期間で集計します。"}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-sm text-ink-sub">
            <span className="rounded-full border border-border-theme bg-surface-alt/70 px-3 py-1.5">対象期間 {range.label}</span>
            <span>{range.from} から {range.to}</span>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-3 md:grid-cols-2">
        <SummaryStatCard
          label="利益"
          value={metrics.periodActualTotal}
          kind="currency"
          tone="success"
          note={range.label}
          className="min-h-[108px]"
        />
        <SummaryStatCard
          label="見込み利益"
          value={metrics.periodEstimatedTotal}
          kind="currency"
          tone="warning"
          note={range.label}
          className="min-h-[108px]"
        />
      </div>

      <SectionCard title="カテゴリ別内訳" description="選択中の期間で、どのカテゴリが利益を作っているかを見やすく整理しています。">
        <div className="grid gap-3 md:grid-cols-3">
          <CategoryCard label="ポイ活" actual={metrics.categories.point.actual} estimated={metrics.categories.point.estimated} />
          <CategoryCard label="転売" actual={metrics.categories.resale.actual} estimated={metrics.categories.resale.estimated} />
          <CategoryCard label="回線" actual={metrics.categories.mobile.actual} estimated={metrics.categories.mobile.estimated} />
        </div>
      </SectionCard>

      <SectionCard title="対象月サマリー" description="当月を初期表示にし、前後移動または年月選択で単月の状況を追えます。">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-2"
                disabled={currentMonthIndex <= 0}
                onClick={() => setSelectedMonthKey(monthKeys[currentMonthIndex - 1])}
              >
                前月
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="px-3 py-2"
                disabled={currentMonthIndex === -1 || currentMonthIndex >= monthKeys.length - 1}
                onClick={() => setSelectedMonthKey(monthKeys[currentMonthIndex + 1])}
              >
                次月
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[180px,180px]">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-ink">年月</span>
                <Input type="month" value={selectedMonthKey} onChange={(event) => setSelectedMonthKey(event.target.value)} />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-ink">候補から選択</span>
                <Select value={selectedMonthKey} onChange={(event) => setSelectedMonthKey(event.target.value)}>
                  {monthKeys.map((monthKey) => (
                    <option key={monthKey} value={monthKey}>{monthKey}</option>
                  ))}
                </Select>
              </label>
            </div>
          </div>

          <div className="rounded-[24px] border border-border-theme bg-surface-alt/50 p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Month Focus</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">{selectedMonthLabel}</h3>
                <p className="mt-1 text-sm text-ink-sub">完了 {monthRow.actualCount} 件 / 見込み {monthRow.estimatedCount} 件</p>
              </div>
              <p className="rounded-full bg-surface px-3 py-1.5 text-[11px] font-medium text-ink-sub">
                合計 {formatCurrency(monthRow.actual + monthRow.estimated)}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-3">
              <div className="rounded-[18px] border border-border-theme bg-surface px-3 py-3 text-center">
                <p className="text-[11px] text-ink-sub">件数</p>
                <p className="mt-1 text-lg font-semibold tracking-tight">{monthRow.recordCount}</p>
              </div>
              <div className="rounded-[18px] border border-profit/20 bg-profit-bg px-3 py-3 text-center">
                <p className="text-[11px] text-ink-sub">利益</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-profit">{formatCurrency(monthRow.actual)}</p>
              </div>
              <div className="rounded-[18px] border border-prospect/20 bg-prospect-bg px-3 py-3 text-center">
                <p className="text-[11px] text-ink-sub">見込み利益</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-prospect">{formatCurrency(monthRow.estimated)}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <div className="rounded-[18px] border border-border-theme bg-surface px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">ポイ活</span>
                  <span className="text-xs text-ink-sub">月次内訳</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-ink-sub">利益</span>
                  <span className="font-medium text-profit">{formatCurrency(monthRow.pointActual)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-ink-sub">見込み</span>
                  <span className="font-medium text-prospect">{formatCurrency(monthRow.pointEstimated)}</span>
                </div>
              </div>

              <div className="rounded-[18px] border border-border-theme bg-surface px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">転売</span>
                  <span className="text-xs text-ink-sub">月次内訳</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-ink-sub">利益</span>
                  <span className="font-medium text-profit">{formatCurrency(monthRow.resaleActual)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-ink-sub">見込み</span>
                  <span className="font-medium text-prospect">{formatCurrency(monthRow.resaleEstimated)}</span>
                </div>
              </div>

              <div className="rounded-[18px] border border-border-theme bg-surface px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">回線</span>
                  <span className="text-xs text-ink-sub">月次内訳</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-ink-sub">利益</span>
                  <span className="font-medium text-profit">{formatCurrency(monthRow.mobileActual)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-ink-sub">見込み</span>
                  <span className="font-medium text-prospect">{formatCurrency(monthRow.mobileEstimated)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

