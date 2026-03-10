"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTodayDateString, normalizeOptionalDate, normalizeOptionalText, parseNumberInput } from "@/lib/utils";
import { mobileLineFormSchema, type MobileLineFormValues } from "@/lib/validation/forms";

function getClient() {
  const client = createSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase の接続設定が不足しています。");
  }

  return client;
}

function resolveCompletedDate(values: Pick<MobileLineFormValues, "is_completed" | "completed_date">) {
  if (!values.is_completed) {
    return null;
  }

  return normalizeOptionalDate(values.completed_date) ?? getTodayDateString();
}

function buildLineValues(values: MobileLineFormValues) {
  return {
    contract_date: values.contract_date,
    line_type: values.line_type,
    carrier_id: values.carrier_id,
    phone_number: values.phone_number,
    registered_email: normalizeOptionalText(values.registered_email),
    management_id: normalizeOptionalText(values.management_id),
    title: values.title,
    reward_amount: values.reward_amount ? parseNumberInput(values.reward_amount) : null,
    initial_cost: parseNumberInput(values.initial_cost),
    cancellation_cost: parseNumberInput(values.cancellation_cost),
    cancellation_date: normalizeOptionalDate(values.cancellation_date),
    completed_date: resolveCompletedDate(values),
    contract_status: values.contract_status,
    device_name: normalizeOptionalText(values.device_name),
    return_due_date: normalizeOptionalDate(values.return_due_date),
    returned_date: normalizeOptionalDate(values.returned_date),
    is_completed: values.is_completed,
    memo: normalizeOptionalText(values.memo),
  };
}

function revalidateMobilePages() {
  revalidatePath("/");
  revalidatePath("/mobile-lines");
}

export async function saveMobileLine(values: MobileLineFormValues) {
  const parsed = mobileLineFormSchema.parse(values);
  const client = getClient();
  const mobileLinesTable = (client as any).from("mobile_lines");
  const mobileLineCostsTable = (client as any).from("mobile_line_monthly_costs");
  const lineValues = buildLineValues(parsed);
  const insertPayload: Database["public"]["Tables"]["mobile_lines"]["Insert"] = lineValues;
  const updatePayload: Database["public"]["Tables"]["mobile_lines"]["Update"] = lineValues;
  let lineId = parsed.id;

  if (parsed.id) {
    const { error } = await mobileLinesTable.update(updatePayload).eq("id", parsed.id);

    if (error) {
      throw error;
    }
  } else {
    const { data, error } = await mobileLinesTable.insert(insertPayload).select("id").single();

    if (error) {
      throw error;
    }

    lineId = data.id;
  }

  if (!lineId) {
    throw new Error("回線 ID の解決に失敗しました。");
  }

  const { error: deleteCostsError } = await mobileLineCostsTable.delete().eq("mobile_line_id", lineId);

  if (deleteCostsError) {
    throw deleteCostsError;
  }

  if (parsed.monthly_costs.length > 0) {
    const rows: Database["public"]["Tables"]["mobile_line_monthly_costs"]["Insert"][] = parsed.monthly_costs.map((cost) => ({
      mobile_line_id: lineId,
      start_date: cost.start_date,
      end_date: normalizeOptionalDate(cost.end_date),
      monthly_fee: parseNumberInput(cost.monthly_fee),
      memo: normalizeOptionalText(cost.memo),
    }));

    const { error: insertCostsError } = await mobileLineCostsTable.insert(rows);

    if (insertCostsError) {
      throw insertCostsError;
    }
  }

  revalidateMobilePages();
}

export async function deleteMobileLine(id: string) {
  const client = getClient();
  const mobileLinesTable = (client as any).from("mobile_lines");
  const { error } = await mobileLinesTable.delete().eq("id", id);

  if (error) {
    throw error;
  }

  revalidateMobilePages();
}

export async function toggleMobileLineCompleted(id: string, isCompleted: boolean) {
  const client = getClient();
  const mobileLinesTable = (client as any).from("mobile_lines");
  const { data, error: selectError } = await mobileLinesTable.select("completed_date").eq("id", id).single();

  if (selectError) {
    throw selectError;
  }

  const { error } = await mobileLinesTable
    .update({
      is_completed: isCompleted,
      completed_date: isCompleted ? data.completed_date ?? getTodayDateString() : null,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }

  revalidateMobilePages();
}

export async function toggleMobileLineCancelled(id: string, isCancelled: boolean) {
  const client = getClient();
  const mobileLinesTable = (client as any).from("mobile_lines");
  const nextStatus: Database["public"]["Tables"]["mobile_lines"]["Row"]["contract_status"] = isCancelled ? "cancelled" : "active";
  const { error } = await mobileLinesTable.update({ contract_status: nextStatus }).eq("id", id);

  if (error) {
    throw error;
  }

  revalidateMobilePages();
}
