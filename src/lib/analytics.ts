import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { calculateMobileLineProfit, calculateResaleProfit } from "@/lib/calculations";
import type { MobileLineRow, PointActivityRow, ResaleTransactionRow } from "@/lib/data";

export type SummaryItem = {
  label: string;
  value: number;
  tone?: "default" | "success" | "muted" | "warning";
  kind?: "number" | "currency";
  note?: string;
};

export type DashboardPeriodPreset = "thisYear" | "thisMonth" | "lastMonth" | "last3Months" | "custom";

type DashboardCategoryKey = "point" | "resale" | "mobile";

type CategoryTotals = Record<DashboardCategoryKey, { actual: number; estimated: number }>;

export type DashboardMonthRow = {
  monthKey: string;
  label: string;
  recordCount: number;
  actualCount: number;
  estimatedCount: number;
  actual: number;
  estimated: number;
  pointActual: number;
  pointEstimated: number;
  resaleActual: number;
  resaleEstimated: number;
  mobileActual: number;
  mobileEstimated: number;
};

export type DashboardRange = {
  preset: DashboardPeriodPreset;
  from: string;
  to: string;
  label: string;
};

export type DashboardMetrics = {
  currentYear: number;
  currentMonthKey: string;
  rangeFrom: string;
  rangeTo: string;
  periodActualTotal: number;
  periodEstimatedTotal: number;
  periodTotal: number;
  monthActualTotal: number;
  monthEstimatedTotal: number;
  monthTotal: number;
  categories: CategoryTotals;
  monthlyRows: DashboardMonthRow[];
};

function isInMonth(date: string, monthKey: string) {
  return date.startsWith(monthKey);
}

function isWithinRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

function getPointAggregationDate(record: PointActivityRow) {
  return record.is_completed ? record.completed_date ?? record.activity_date : record.activity_date;
}

function getResaleAggregationDate(record: ResaleTransactionRow) {
  return record.is_completed ? record.sale_date ?? record.purchase_date : record.purchase_date;
}

function getMobileAggregationDate(record: MobileLineRow) {
  return record.is_completed ? record.completed_date ?? record.cancellation_date ?? record.contract_date : record.contract_date;
}

export function getPointActivityFilterDate(record: PointActivityRow, tab: "active" | "completed") {
  return tab === "completed" ? getPointAggregationDate(record) : record.activity_date;
}

export function getResaleTransactionFilterDate(record: ResaleTransactionRow, tab: "active" | "completed") {
  return tab === "completed" ? getResaleAggregationDate(record) : record.purchase_date;
}

export function getMobileLineFilterDate(record: MobileLineRow, tab: "active" | "completed") {
  return tab === "completed" ? getMobileAggregationDate(record) : record.contract_date;
}

function createEmptyCategoryTotals(): CategoryTotals {
  return {
    point: { actual: 0, estimated: 0 },
    resale: { actual: 0, estimated: 0 },
    mobile: { actual: 0, estimated: 0 },
  };
}

function getMonthRowsBetween(from: string, to: string) {
  const rows: DashboardMonthRow[] = [];
  const cursor = new Date(`${from.slice(0, 7)}-01T00:00:00`);
  const limit = new Date(`${to.slice(0, 7)}-01T00:00:00`);

  while (cursor <= limit) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    rows.push({
      monthKey,
      label: format(new Date(year, month - 1, 1), "M月"),
      recordCount: 0,
      actualCount: 0,
      estimatedCount: 0,
      actual: 0,
      estimated: 0,
      pointActual: 0,
      pointEstimated: 0,
      resaleActual: 0,
      resaleEstimated: 0,
      mobileActual: 0,
      mobileEstimated: 0,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return rows;
}

function addToMonthRow(rows: DashboardMonthRow[], monthKey: string, category: DashboardCategoryKey, amount: number, isActual: boolean) {
  const row = rows.find((item) => item.monthKey === monthKey);

  if (!row) {
    return;
  }

  row.recordCount += 1;

  if (isActual) {
    row.actualCount += 1;
    row.actual += amount;
  } else {
    row.estimatedCount += 1;
    row.estimated += amount;
  }

  if (category === "point") {
    if (isActual) {
      row.pointActual += amount;
    } else {
      row.pointEstimated += amount;
    }
  }

  if (category === "resale") {
    if (isActual) {
      row.resaleActual += amount;
    } else {
      row.resaleEstimated += amount;
    }
  }

  if (category === "mobile") {
    if (isActual) {
      row.mobileActual += amount;
    } else {
      row.mobileEstimated += amount;
    }
  }
}

function accumulate(categoryTotals: CategoryTotals, category: DashboardCategoryKey, amount: number, isActual: boolean) {
  if (isActual) {
    categoryTotals[category].actual += amount;
  } else {
    categoryTotals[category].estimated += amount;
  }
}

export function getDashboardMonthKeys(params: {
  pointActivities: PointActivityRow[];
  resaleTransactions: ResaleTransactionRow[];
  mobileLines: MobileLineRow[];
}) {
  const keys = new Set<string>();

  for (const record of params.pointActivities) {
    keys.add(getPointAggregationDate(record).slice(0, 7));
  }

  for (const record of params.resaleTransactions) {
    keys.add(getResaleAggregationDate(record).slice(0, 7));
  }

  for (const record of params.mobileLines) {
    if (record.line_type === "campaign") {
      keys.add(getMobileAggregationDate(record).slice(0, 7));
    }
  }

  return Array.from(keys).sort((left, right) => left.localeCompare(right));
}

export function resolveDashboardRange(
  preset: DashboardPeriodPreset,
  customRange?: { from?: string; to?: string },
  now = new Date(),
): DashboardRange {
  const currentYear = Number(format(now, "yyyy"));
  const thisMonthStart = startOfMonth(now);

  if (preset === "thisMonth") {
    return {
      preset,
      from: format(thisMonthStart, "yyyy-MM-dd"),
      to: format(endOfMonth(now), "yyyy-MM-dd"),
      label: format(now, "yyyy年M月"),
    };
  }

  if (preset === "lastMonth") {
    const target = subMonths(now, 1);

    return {
      preset,
      from: format(startOfMonth(target), "yyyy-MM-dd"),
      to: format(endOfMonth(target), "yyyy-MM-dd"),
      label: format(target, "yyyy年M月"),
    };
  }

  if (preset === "last3Months") {
    return {
      preset,
      from: format(subMonths(thisMonthStart, 2), "yyyy-MM-dd"),
      to: format(endOfMonth(now), "yyyy-MM-dd"),
      label: "直近3か月",
    };
  }

  if (preset === "custom" && customRange?.from && customRange?.to) {
    return {
      preset,
      from: customRange.from,
      to: customRange.to,
      label: `${customRange.from} - ${customRange.to}`,
    };
  }

  return {
    preset: "thisYear",
    from: `${currentYear}-01-01`,
    to: `${currentYear}-12-31`,
    label: `${currentYear}年`,
  };
}

export function computePointActivitySummary(records: PointActivityRow[]): SummaryItem[] {
  const activeRecords = records.filter((record) => !record.is_completed);
  const completedRecords = records.filter((record) => record.is_completed);

  return [
    { label: "進行中件数", value: activeRecords.length },
    { label: "完了済件数", value: completedRecords.length, tone: "success" },
    {
      label: "確定報酬合計",
      value: completedRecords.reduce((total, record) => total + Number(record.reward_amount), 0),
      tone: "success",
      kind: "currency",
    },
    {
      label: "見込み報酬合計",
      value: activeRecords.reduce((total, record) => total + Number(record.reward_amount), 0),
      tone: "warning",
      kind: "currency",
    },
  ];
}

export function computeResaleSummary(records: ResaleTransactionRow[]): SummaryItem[] {
  const activeRecords = records.filter((record) => !record.is_completed);
  const completedRecords = records.filter((record) => record.is_completed);

  return [
    { label: "進行中件数", value: activeRecords.length },
    { label: "完了済件数", value: completedRecords.length, tone: "success" },
    {
      label: "確定利益合計",
      value: completedRecords.reduce((total, record) => total + calculateResaleProfit(record), 0),
      kind: "currency",
      tone: "success",
    },
    {
      label: "見込み利益合計",
      value: activeRecords.reduce((total, record) => total + calculateResaleProfit(record), 0),
      kind: "currency",
      tone: "warning",
    },
    {
      label: "売却額合計",
      value: completedRecords.reduce((total, record) => total + Number(record.sale_amount ?? 0), 0),
      kind: "currency",
      tone: "success",
    },
    {
      label: "仕入額合計",
      value: records.reduce((total, record) => total + Number(record.purchase_amount), 0),
      kind: "currency",
    },
  ];
}

export function computeMobileLineSummary(records: MobileLineRow[]): SummaryItem[] {
  const campaignLines = records.filter((record) => record.line_type === "campaign");
  const activeLines = records.filter((record) => !record.is_completed);
  const completedLines = records.filter((record) => record.is_completed);
  const cancelledLines = records.filter((record) => record.contract_status === "cancelled");
  const rewardCompletedLines = campaignLines.filter((record) => record.is_completed);
  const rewardPendingLines = campaignLines.filter((record) => !record.is_completed);

  return [
    { label: "進行中件数", value: activeLines.length },
    { label: "完了済件数", value: completedLines.length, tone: "success" },
    {
      label: "確定報酬合計",
      value: rewardCompletedLines.reduce((total, record) => total + Number(record.reward_amount ?? 0), 0),
      kind: "currency",
      tone: "success",
    },
    {
      label: "見込み報酬合計",
      value: rewardPendingLines.reduce((total, record) => total + Number(record.reward_amount ?? 0), 0),
      kind: "currency",
      tone: "warning",
    },
    { label: "案件回線数", value: campaignLines.length },
    { label: "解約済件数", value: cancelledLines.length, tone: "muted" },
  ];
}

export function computeDashboardMetrics(
  params: {
    pointActivities: PointActivityRow[];
    resaleTransactions: ResaleTransactionRow[];
    mobileLines: MobileLineRow[];
  },
  options?: { from?: string; to?: string; now?: Date },
): DashboardMetrics {
  const currentDate = options?.now ?? new Date();
  const currentYear = Number(format(currentDate, "yyyy"));
  const currentMonthKey = format(currentDate, "yyyy-MM");
  const fallbackRange = resolveDashboardRange("thisYear", undefined, currentDate);
  const rangeFrom = options?.from ?? fallbackRange.from;
  const rangeTo = options?.to ?? fallbackRange.to;
  const categoryTotals = createEmptyCategoryTotals();
  const monthlyRows = getMonthRowsBetween(rangeFrom, rangeTo);
  let periodActualTotal = 0;
  let periodEstimatedTotal = 0;
  let monthActualTotal = 0;
  let monthEstimatedTotal = 0;

  for (const record of params.pointActivities) {
    const amount = Number(record.reward_amount);
    const aggregationDate = getPointAggregationDate(record);
    const isActual = record.is_completed;

    if (!isWithinRange(aggregationDate, rangeFrom, rangeTo)) {
      continue;
    }

    accumulate(categoryTotals, "point", amount, isActual);
    addToMonthRow(monthlyRows, aggregationDate.slice(0, 7), "point", amount, isActual);

    if (isActual) {
      periodActualTotal += amount;
    } else {
      periodEstimatedTotal += amount;
    }

    if (isInMonth(aggregationDate, currentMonthKey)) {
      if (isActual) {
        monthActualTotal += amount;
      } else {
        monthEstimatedTotal += amount;
      }
    }
  }

  for (const record of params.resaleTransactions) {
    const amount = calculateResaleProfit(record);
    const aggregationDate = getResaleAggregationDate(record);
    const isActual = record.is_completed;

    if (!isWithinRange(aggregationDate, rangeFrom, rangeTo)) {
      continue;
    }

    accumulate(categoryTotals, "resale", amount, isActual);
    addToMonthRow(monthlyRows, aggregationDate.slice(0, 7), "resale", amount, isActual);

    if (isActual) {
      periodActualTotal += amount;
    } else {
      periodEstimatedTotal += amount;
    }

    if (isInMonth(aggregationDate, currentMonthKey)) {
      if (isActual) {
        monthActualTotal += amount;
      } else {
        monthEstimatedTotal += amount;
      }
    }
  }

  for (const record of params.mobileLines) {
    if (record.line_type !== "campaign") {
      continue;
    }

    const amount = calculateMobileLineProfit(record, record.monthly_costs ?? []);
    const aggregationDate = getMobileAggregationDate(record);
    const isActual = record.is_completed;

    if (!isWithinRange(aggregationDate, rangeFrom, rangeTo)) {
      continue;
    }

    accumulate(categoryTotals, "mobile", amount, isActual);
    addToMonthRow(monthlyRows, aggregationDate.slice(0, 7), "mobile", amount, isActual);

    if (isActual) {
      periodActualTotal += amount;
    } else {
      periodEstimatedTotal += amount;
    }

    if (isInMonth(aggregationDate, currentMonthKey)) {
      if (isActual) {
        monthActualTotal += amount;
      } else {
        monthEstimatedTotal += amount;
      }
    }
  }

  return {
    currentYear,
    currentMonthKey,
    rangeFrom,
    rangeTo,
    periodActualTotal,
    periodEstimatedTotal,
    periodTotal: periodActualTotal + periodEstimatedTotal,
    monthActualTotal,
    monthEstimatedTotal,
    monthTotal: monthActualTotal + monthEstimatedTotal,
    categories: categoryTotals,
    monthlyRows,
  };
}

export function getPointActivityTabCounts(records: PointActivityRow[]) {
  return {
    active: records.filter((record) => !record.is_completed).length,
    completed: records.filter((record) => record.is_completed).length,
  };
}

export function getResaleTabCounts(records: ResaleTransactionRow[]) {
  return {
    active: records.filter((record) => !record.is_completed).length,
    completed: records.filter((record) => record.is_completed).length,
  };
}

export function getMobileLineTabCounts(records: MobileLineRow[]) {
  return {
    active: records.filter((record) => !record.is_completed).length,
    completed: records.filter((record) => record.is_completed).length,
  };
}

export function filterPointActivitiesByTab(records: PointActivityRow[], tab: "active" | "completed") {
  return records.filter((record) => (tab === "active" ? !record.is_completed : record.is_completed));
}

export function filterResaleTransactionsByTab(records: ResaleTransactionRow[], tab: "active" | "completed") {
  return records.filter((record) => (tab === "active" ? !record.is_completed : record.is_completed));
}

export function filterMobileLinesByTab(records: MobileLineRow[], tab: "active" | "completed") {
  return records.filter((record) => (tab === "active" ? !record.is_completed : record.is_completed));
}
