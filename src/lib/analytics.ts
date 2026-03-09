import { format } from "date-fns";
import { calculateMobileLineProfit, calculateMobileLineTotalCost, calculateResaleProfit } from "@/lib/calculations";
import type { MobileLineRow, PointActivityRow, ResaleTransactionRow } from "@/lib/data";

export type SummaryItem = {
  label: string;
  value: number;
  tone?: "default" | "success" | "muted" | "warning";
  kind?: "number" | "currency";
  note?: string;
};

type DashboardCategoryKey = "point" | "resale" | "mobile";

type CategoryTotals = Record<DashboardCategoryKey, { actual: number; estimated: number }>;

export type DashboardMonthRow = {
  monthKey: string;
  label: string;
  actual: number;
  estimated: number;
  pointActual: number;
  pointEstimated: number;
  resaleActual: number;
  resaleEstimated: number;
  mobileActual: number;
  mobileEstimated: number;
};

export type DashboardMetrics = {
  currentYear: number;
  currentMonthKey: string;
  yearActualTotal: number;
  yearEstimatedTotal: number;
  yearTotal: number;
  monthActualTotal: number;
  monthEstimatedTotal: number;
  monthTotal: number;
  categories: CategoryTotals;
  monthlyRows: DashboardMonthRow[];
};

function isInYear(date: string, year: number) {
  return date.startsWith(String(year));
}

function isInMonth(date: string, monthKey: string) {
  return date.startsWith(monthKey);
}

function createEmptyCategoryTotals(): CategoryTotals {
  return {
    point: { actual: 0, estimated: 0 },
    resale: { actual: 0, estimated: 0 },
    mobile: { actual: 0, estimated: 0 },
  };
}

function getMonthRows(year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    return {
      monthKey,
      label: format(new Date(year, index, 1), "M月"),
      actual: 0,
      estimated: 0,
      pointActual: 0,
      pointEstimated: 0,
      resaleActual: 0,
      resaleEstimated: 0,
      mobileActual: 0,
      mobileEstimated: 0,
    } satisfies DashboardMonthRow;
  }).reverse();
}

function addToMonthRow(rows: DashboardMonthRow[], monthKey: string, category: DashboardCategoryKey, amount: number, isActual: boolean) {
  const row = rows.find((item) => item.monthKey === monthKey);

  if (!row) {
    return;
  }

  if (isActual) {
    row.actual += amount;
  } else {
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

export function computePointActivitySummary(records: PointActivityRow[]): SummaryItem[] {
  const activeRecords = records.filter((record) => !record.is_completed);
  const completedRecords = records.filter((record) => record.is_completed);

  return [
    { label: "アクティブ件数", value: activeRecords.length },
    { label: "完了件数", value: completedRecords.length, tone: "success" },
    {
      label: "見込み報酬合計",
      value: activeRecords.reduce((total, record) => total + Number(record.reward_amount), 0),
      tone: "warning",
      kind: "currency",
    },
    {
      label: "実報酬合計",
      value: completedRecords.reduce((total, record) => total + Number(record.reward_amount), 0),
      tone: "success",
      kind: "currency",
    },
  ];
}

export function computeResaleSummary(records: ResaleTransactionRow[]): SummaryItem[] {
  const activeRecords = records.filter((record) => !record.is_completed);
  const completedRecords = records.filter((record) => record.is_completed);

  return [
    { label: "アクティブ件数", value: activeRecords.length },
    { label: "完了件数", value: completedRecords.length, tone: "success" },
    {
      label: "売却額合計",
      value: completedRecords.reduce((total, record) => total + Number(record.sale_amount ?? 0), 0),
      kind: "currency",
      tone: "success",
    },
    {
      label: "仕入れ値合計",
      value: records.reduce((total, record) => total + Number(record.purchase_amount), 0),
      kind: "currency",
    },
    {
      label: "利益合計",
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
  ];
}

export function computeMobileLineSummary(records: MobileLineRow[]): SummaryItem[] {
  const campaignLines = records.filter((record) => record.line_type === "campaign");
  const activeLines = records.filter((record) => record.contract_status !== "cancelled");
  const cancelledLines = records.filter((record) => record.contract_status === "cancelled");
  const rewardCompletedLines = campaignLines.filter((record) => record.is_completed);
  const rewardPendingLines = campaignLines.filter((record) => !record.is_completed);

  return [
    { label: "アクティブ件数", value: activeLines.length },
    { label: "完了件数", value: cancelledLines.length, tone: "muted", note: "解約済みの件数" },
    { label: "特典完了件数", value: rewardCompletedLines.length, tone: "success" },
    { label: "解約済件数", value: cancelledLines.length, tone: "muted" },
    {
      label: "報酬合計",
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
  ];
}

export function computeDashboardMetrics(params: {
  pointActivities: PointActivityRow[];
  resaleTransactions: ResaleTransactionRow[];
  mobileLines: MobileLineRow[];
}): DashboardMetrics {
  const currentDate = new Date();
  const currentYear = Number(format(currentDate, "yyyy"));
  const currentMonthKey = format(currentDate, "yyyy-MM");
  const categoryTotals = createEmptyCategoryTotals();
  const monthlyRows = getMonthRows(currentYear);
  let yearActualTotal = 0;
  let yearEstimatedTotal = 0;
  let monthActualTotal = 0;
  let monthEstimatedTotal = 0;

  for (const record of params.pointActivities) {
    const amount = Number(record.reward_amount);
    const aggregationDate = record.is_completed ? record.completed_date ?? record.activity_date : record.activity_date;
    const isActual = record.is_completed;

    if (!isInYear(aggregationDate, currentYear)) {
      continue;
    }

    accumulate(categoryTotals, "point", amount, isActual);
    addToMonthRow(monthlyRows, aggregationDate.slice(0, 7), "point", amount, isActual);

    if (isActual) {
      yearActualTotal += amount;
    } else {
      yearEstimatedTotal += amount;
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
    const aggregationDate = record.is_completed ? record.sale_date ?? record.purchase_date : record.purchase_date;
    const isActual = record.is_completed;

    if (!isInYear(aggregationDate, currentYear)) {
      continue;
    }

    accumulate(categoryTotals, "resale", amount, isActual);
    addToMonthRow(monthlyRows, aggregationDate.slice(0, 7), "resale", amount, isActual);

    if (isActual) {
      yearActualTotal += amount;
    } else {
      yearEstimatedTotal += amount;
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
    const aggregationDate = record.is_completed
      ? record.completed_date ?? record.cancellation_date ?? record.contract_date
      : record.contract_date;
    const isActual = record.is_completed;

    if (!isInYear(aggregationDate, currentYear)) {
      continue;
    }

    accumulate(categoryTotals, "mobile", amount, isActual);
    addToMonthRow(monthlyRows, aggregationDate.slice(0, 7), "mobile", amount, isActual);

    if (isActual) {
      yearActualTotal += amount;
    } else {
      yearEstimatedTotal += amount;
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
    yearActualTotal,
    yearEstimatedTotal,
    yearTotal: yearActualTotal + yearEstimatedTotal,
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
    active: records.filter((record) => record.contract_status !== "cancelled").length,
    completed: records.filter((record) => record.contract_status === "cancelled").length,
  };
}

export function filterPointActivitiesByTab(records: PointActivityRow[], tab: "active" | "completed") {
  return records.filter((record) => (tab === "active" ? !record.is_completed : record.is_completed));
}

export function filterResaleTransactionsByTab(records: ResaleTransactionRow[], tab: "active" | "completed") {
  return records.filter((record) => (tab === "active" ? !record.is_completed : record.is_completed));
}

export function filterMobileLinesByTab(records: MobileLineRow[], tab: "active" | "completed") {
  return records.filter((record) => (tab === "active" ? record.contract_status !== "cancelled" : record.contract_status === "cancelled"));
}