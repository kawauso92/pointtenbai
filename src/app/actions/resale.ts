"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeOptionalDate, normalizeOptionalText, parseNumberInput } from "@/lib/utils";
import { resaleTransactionFormSchema, type ResaleTransactionFormValues } from "@/lib/validation/forms";

function getClient() {
  const client = createSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase の接続設定が不足しています。");
  }

  return client;
}

function buildPayload(values: ResaleTransactionFormValues) {
  return {
    purchase_date: values.purchase_date,
    item_name: values.item_name,
    purchase_source_id: values.purchase_source_id,
    purchase_source_note: normalizeOptionalText(values.purchase_source_note),
    sales_channel_id: values.sales_channel_id,
    sales_channel_note: normalizeOptionalText(values.sales_channel_note),
    purchase_amount: parseNumberInput(values.purchase_amount),
    sale_amount: values.sale_amount ? parseNumberInput(values.sale_amount) : null,
    sale_date: normalizeOptionalDate(values.sale_date),
    discount_amount: parseNumberInput(values.discount_amount),
    shipping_fee: parseNumberInput(values.shipping_fee),
    fee_amount: parseNumberInput(values.fee_amount),
    other_expense: parseNumberInput(values.other_expense),
    is_completed: values.is_completed,
    memo: normalizeOptionalText(values.memo),
  };
}

function revalidateResalePages() {
  revalidatePath("/");
  revalidatePath("/resale");
}

export async function saveResaleTransaction(values: ResaleTransactionFormValues) {
  const parsed = resaleTransactionFormSchema.parse(values);
  const client = getClient();
  const resaleTransactionsTable = (client as any).from("resale_transactions");
  const basePayload = buildPayload(parsed);
  const insertPayload: Database["public"]["Tables"]["resale_transactions"]["Insert"] = basePayload;
  const updatePayload: Database["public"]["Tables"]["resale_transactions"]["Update"] = basePayload;

  if (parsed.id) {
    const { error } = await resaleTransactionsTable.update(updatePayload).eq("id", parsed.id);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await resaleTransactionsTable.insert(insertPayload);

    if (error) {
      throw error;
    }
  }

  revalidateResalePages();
}

export async function deleteResaleTransaction(id: string) {
  const client = getClient();
  const resaleTransactionsTable = (client as any).from("resale_transactions");
  const { error } = await resaleTransactionsTable.delete().eq("id", id);

  if (error) {
    throw error;
  }

  revalidateResalePages();
}

export async function toggleResaleTransactionCompleted(id: string, isCompleted: boolean) {
  const client = getClient();
  const resaleTransactionsTable = (client as any).from("resale_transactions");
  const { error } = await resaleTransactionsTable.update({ is_completed: isCompleted }).eq("id", id);

  if (error) {
    throw error;
  }

  revalidateResalePages();
}
