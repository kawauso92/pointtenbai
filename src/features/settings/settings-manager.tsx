"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { saveSettingRecord, toggleSettingRecord } from "@/app/actions/settings";
import { ConfigurationNotice } from "@/components/configuration-notice";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { settingsCategoryMeta } from "@/lib/constants";
import type { CarrierOption, PointSiteOption, PurchaseSourceOption, SalesChannelOption } from "@/lib/data";
import type { LookupTableName } from "@/lib/database.types";
import { settingRecordSchema, type SettingRecordFormValues } from "@/lib/validation/forms";

type SettingsManagerProps = {
  isConfigured: boolean;
  pointSites: PointSiteOption[];
  purchaseSources: PurchaseSourceOption[];
  salesChannels: SalesChannelOption[];
  carriers: CarrierOption[];
};

const categories = ["point_sites", "purchase_sources", "sales_channels", "carriers"] as const;

function createEmptyValues(): SettingRecordFormValues {
  return {
    name: "",
    sort_order: "0",
    is_active: true,
  };
}

export function SettingsManager({
  isConfigured,
  pointSites,
  purchaseSources,
  salesChannels,
  carriers,
}: SettingsManagerProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<LookupTableName>("point_sites");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const itemsByCategory = {
    point_sites: pointSites,
    purchase_sources: purchaseSources,
    sales_channels: salesChannels,
    carriers,
  };
  const currentItems = itemsByCategory[activeCategory];
  const editingRecord = currentItems.find((item) => item.id === editingId) ?? null;
  const form = useForm<SettingRecordFormValues>({
    resolver: zodResolver(settingRecordSchema),
    defaultValues: createEmptyValues(),
  });

  useEffect(() => {
    if (editingRecord) {
      form.reset({
        id: editingRecord.id,
        name: editingRecord.name,
        sort_order: String(editingRecord.sort_order),
        is_active: editingRecord.is_active,
      });
      return;
    }

    form.reset(createEmptyValues());
  }, [editingRecord, form, activeCategory]);

  const onSubmit = form.handleSubmit((values) => {
    setFeedback(null);
    startTransition(async () => {
      try {
        await saveSettingRecord(activeCategory, values);
        setEditingId(null);
        setFeedback("保存しました。");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "保存に失敗しました。");
      }
    });
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
      <SectionCard title="マスタ候補一覧" description="有効 / 無効は過去データを壊さずに切り替えます。">
        {!isConfigured ? <ConfigurationNotice /> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === category ? "bg-nav-active text-nav-active-text" : "bg-surface-alt text-ink-sub hover:bg-surface hover:text-ink"
              }`}
              onClick={() => {
                setActiveCategory(category);
                setEditingId(null);
                setFeedback(null);
              }}
            >
              {settingsCategoryMeta[category].label}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-border-theme">
          <div className="hidden grid-cols-[1.6fr,0.7fr,0.7fr,1fr] gap-3 bg-surface-alt px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-sub md:grid">
            <span>名称</span>
            <span>並び順</span>
            <span>状態</span>
            <span>操作</span>
          </div>
          <div className="divide-y divide-border-theme bg-surface/75">
            {currentItems.map((item) => (
              <div key={item.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.6fr,0.7fr,0.7fr,1fr] md:items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-xs text-ink-sub md:hidden">並び順: {item.sort_order}</p>
                </div>
                <div className="hidden text-sm text-ink-sub md:block">{item.sort_order}</div>
                <div>
                  <StatusBadge tone={item.is_active ? "success" : "muted"}>
                    {item.is_active ? "有効" : "無効"}
                  </StatusBadge>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditingId(item.id)}>
                    編集
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      startTransition(async () => {
                        try {
                          await toggleSettingRecord(activeCategory, item.id, !item.is_active);
                          setFeedback(null);
                          router.refresh();
                        } catch (error) {
                          setFeedback(error instanceof Error ? error.message : "更新に失敗しました。");
                        }
                      });
                    }}
                  >
                    {item.is_active ? "無効化" : "有効化"}
                  </Button>
                </div>
              </div>
            ))}
            {currentItems.length === 0 ? <div className="px-4 py-8 text-sm text-ink-sub">まだデータがありません。</div> : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="追加 / 編集" description={`${settingsCategoryMeta[activeCategory].label} を登録します。`}>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label="名称" required error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} placeholder="名称を入力" />
          </Field>

          <Field label="並び順" required error={form.formState.errors.sort_order?.message}>
            <Input {...form.register("sort_order")} type="number" step="1" />
          </Field>

          <label className="flex items-center gap-3 rounded-2xl border border-border-theme bg-surface-alt/70 px-4 py-3 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded" {...form.register("is_active")} />
            登録直後から有効にする
          </label>

          {feedback ? <p className="text-sm text-ink-sub">{feedback}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>{editingRecord ? "更新する" : "追加する"}</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setFeedback(null);
                form.reset(createEmptyValues());
              }}
            >
              新規入力へ戻す
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

