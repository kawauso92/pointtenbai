"use server";

import { revalidatePath } from "next/cache";
import type { LookupTableName } from "@/lib/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { settingRecordSchema, type SettingRecordFormValues } from "@/lib/validation/forms";

function getClient() {
  const client = createSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase の接続設定が不足しています。");
  }

  return client;
}

export async function saveSettingRecord(category: LookupTableName, values: SettingRecordFormValues) {
  const parsed = settingRecordSchema.parse(values);
  const client = getClient();
  const table = (client as any).from(category);
  const payload = {
    name: parsed.name,
    sort_order: Number(parsed.sort_order),
    is_active: parsed.is_active,
  };

  if (parsed.id) {
    const { error } = await table.update(payload).eq("id", parsed.id);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await table.insert(payload);

    if (error) {
      throw error;
    }
  }

  revalidatePath("/settings");
}

export async function toggleSettingRecord(category: LookupTableName, id: string, isActive: boolean) {
  const client = getClient();
  const table = (client as any).from(category);
  const { error } = await table.update({ is_active: isActive }).eq("id", id);

  if (error) {
    throw error;
  }

  revalidatePath("/settings");
}
