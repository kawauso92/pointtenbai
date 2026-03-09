"use server";

import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeOptionalDate, normalizeOptionalText, parseNumberInput } from "@/lib/utils";
import { pointActivityFormSchema, type PointActivityFormValues } from "@/lib/validation/forms";

function getClient() {
  const client = createSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase の接続設定が不足しています。");
  }

  return client;
}

function buildPayload(values: PointActivityFormValues) {
  return {
    activity_date: values.activity_date,
    point_site_id: values.point_site_id,
    title: values.title,
    reward_amount: parseNumberInput(values.reward_amount),
    is_completed: values.is_completed,
    completed_date: normalizeOptionalDate(values.completed_date),
    condition_note: normalizeOptionalText(values.condition_note),
    inquiry_url: normalizeOptionalText(values.inquiry_url),
    memo: normalizeOptionalText(values.memo),
  };
}

function revalidatePointPages() {
  revalidatePath("/");
  revalidatePath("/point-activities");
}

export async function savePointActivity(values: PointActivityFormValues) {
  const parsed = pointActivityFormSchema.parse(values);
  const client = getClient();
  const pointActivitiesTable = (client as any).from("point_activities");
  const basePayload = buildPayload(parsed);
  const insertPayload: Database["public"]["Tables"]["point_activities"]["Insert"] = basePayload;
  const updatePayload: Database["public"]["Tables"]["point_activities"]["Update"] = basePayload;

  if (parsed.id) {
    const { error } = await pointActivitiesTable.update(updatePayload).eq("id", parsed.id);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await pointActivitiesTable.insert(insertPayload);

    if (error) {
      throw error;
    }
  }

  revalidatePointPages();
}

export async function deletePointActivity(id: string) {
  const client = getClient();
  const pointActivitiesTable = (client as any).from("point_activities");
  const { error } = await pointActivitiesTable.delete().eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePointPages();
}

export async function togglePointActivityCompleted(id: string, isCompleted: boolean) {
  const client = getClient();
  const pointActivitiesTable = (client as any).from("point_activities");
  const { error } = await pointActivitiesTable.update({ is_completed: isCompleted }).eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePointPages();
}
