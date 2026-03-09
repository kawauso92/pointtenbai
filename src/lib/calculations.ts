import { parseNumberInput } from "@/lib/utils";
import type { Database } from "@/lib/database.types";

type ResaleRow = Database["public"]["Tables"]["resale_transactions"]["Row"];
type MobileLineRow = Database["public"]["Tables"]["mobile_lines"]["Row"];
type MonthlyCostRow = Database["public"]["Tables"]["mobile_line_monthly_costs"]["Row"];

export function calculateResaleProfit(record: Pick<ResaleRow, "sale_amount" | "purchase_amount" | "shipping_fee" | "fee_amount" | "other_expense" | "discount_amount">) {
  return (
    parseNumberInput(record.sale_amount, 0) -
    parseNumberInput(record.purchase_amount, 0) -
    parseNumberInput(record.shipping_fee, 0) -
    parseNumberInput(record.fee_amount, 0) -
    parseNumberInput(record.other_expense, 0) +
    parseNumberInput(record.discount_amount, 0)
  );
}

export function calculateMobileLineMonthlyCostTotal(costs: Array<Pick<MonthlyCostRow, "monthly_fee">>) {
  return costs.reduce((total, current) => total + parseNumberInput(current.monthly_fee, 0), 0);
}

export function calculateMobileLineTotalCost(
  line: Pick<MobileLineRow, "initial_cost" | "cancellation_cost">,
  costs: Array<Pick<MonthlyCostRow, "monthly_fee">>,
) {
  return parseNumberInput(line.initial_cost, 0) + parseNumberInput(line.cancellation_cost, 0) + calculateMobileLineMonthlyCostTotal(costs);
}

export function calculateMobileLineProfit(
  line: Pick<MobileLineRow, "reward_amount" | "initial_cost" | "cancellation_cost">,
  costs: Array<Pick<MonthlyCostRow, "monthly_fee">>,
) {
  return parseNumberInput(line.reward_amount, 0) - calculateMobileLineTotalCost(line, costs);
}