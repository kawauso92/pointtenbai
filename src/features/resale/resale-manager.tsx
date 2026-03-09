"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { deleteResaleTransaction, saveResaleTransaction, toggleResaleTransactionCompleted } from "@/app/actions/resale";
import { ConfigurationNotice } from "@/components/configuration-notice";
import { SectionCard } from "@/components/section-card";
import { SegmentedTabs } from "@/components/segmented-tabs";
import { StatusBadge } from "@/components/status-badge";
import { SummaryStatCard } from "@/components/summary-stat-card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  computeResaleSummary,
  filterResaleTransactionsByTab,
  getResaleTabCounts,
} from "@/lib/analytics";
import { calculateResaleProfit } from "@/lib/calculations";
import type { PurchaseSourceOption, ResaleTransactionRow, SalesChannelOption } from "@/lib/data";
import { formatCurrency, formatDate, parseNumberInput } from "@/lib/utils";
import { resaleTransactionFormSchema, type ResaleTransactionFormValues } from "@/lib/validation/forms";

type ResaleManagerProps = {
  isConfigured: boolean;
  purchaseSources: PurchaseSourceOption[];
  salesChannels: SalesChannelOption[];
  resaleTransactions: ResaleTransactionRow[];
};

function createEmptyValues(): ResaleTransactionFormValues {
  return {
    purchase_date: "",
    item_name: "",
    purchase_source_id: "",
    purchase_source_note: "",
    sales_channel_id: "",
    sales_channel_note: "",
    purchase_amount: "0",
    sale_amount: "",
    sale_date: "",
    discount_amount: "0",
    shipping_fee: "0",
    fee_amount: "0",
    other_expense: "0",
    is_completed: false,
    memo: "",
  };
}

function toFormValues(record: ResaleTransactionRow): ResaleTransactionFormValues {
  return {
    id: record.id,
    purchase_date: record.purchase_date,
    item_name: record.item_name,
    purchase_source_id: record.purchase_source_id,
    purchase_source_note: record.purchase_source_note ?? "",
    sales_channel_id: record.sales_channel_id,
    sales_channel_note: record.sales_channel_note ?? "",
    purchase_amount: String(record.purchase_amount),
    sale_amount: record.sale_amount === null ? "" : String(record.sale_amount),
    sale_date: record.sale_date ?? "",
    discount_amount: String(record.discount_amount),
    shipping_fee: String(record.shipping_fee),
    fee_amount: String(record.fee_amount),
    other_expense: String(record.other_expense),
    is_completed: record.is_completed,
    memo: record.memo ?? "",
  };
}

export function ResaleManager({ isConfigured, purchaseSources, salesChannels, resaleTransactions }: ResaleManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [isPending, startTransition] = useTransition();
  const editingRecord = resaleTransactions.find((record) => record.id === editingId) ?? null;
  const form = useForm<ResaleTransactionFormValues>({
    resolver: zodResolver(resaleTransactionFormSchema),
    defaultValues: createEmptyValues(),
  });
  const watched = form.watch();
  const previewProfit = calculateResaleProfit({
    sale_amount: watched.sale_amount ? parseNumberInput(watched.sale_amount) : null,
    purchase_amount: parseNumberInput(watched.purchase_amount),
    shipping_fee: parseNumberInput(watched.shipping_fee),
    fee_amount: parseNumberInput(watched.fee_amount),
    other_expense: parseNumberInput(watched.other_expense),
    discount_amount: parseNumberInput(watched.discount_amount),
  });
  const summaryItems = computeResaleSummary(resaleTransactions);
  const tabCounts = getResaleTabCounts(resaleTransactions);
  const visibleRecords = filterResaleTransactionsByTab(resaleTransactions, tab);

  useEffect(() => {
    form.reset(editingRecord ? toFormValues(editingRecord) : createEmptyValues());
  }, [editingRecord, form]);

  const onSubmit = form.handleSubmit((values) => {
    setFeedback(null);
    startTransition(async () => {
      try {
        await saveResaleTransaction(values);
        setEditingId(null);
        setFeedback("保存しました。");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "保存に失敗しました。");
      }
    });
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {summaryItems.map((item) => (
          <SummaryStatCard key={item.label} {...item} className="min-h-[96px]" />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.14fr,0.86fr]">
        <SectionCard
          title="取引一覧"
          description="完了チェックを基準に、見込み利益と実利益を切り分けて管理します。"
          action={
            <SegmentedTabs
              items={[
                { value: "active", label: "アクティブ", count: tabCounts.active },
                { value: "completed", label: "完了", count: tabCounts.completed },
              ]}
              value={tab}
              onChange={setTab}
            />
          }
        >
          {!isConfigured ? <ConfigurationNotice /> : null}

          <div className="mt-4 space-y-3 md:hidden">
            {visibleRecords.map((record) => (
              <div
                key={record.id}
                className={[
                  "rounded-[26px] border p-4",
                  record.is_completed ? "border-emerald-100 bg-emerald-50/65" : "border-black/5 bg-canvas/55",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-ink/52">{formatDate(record.purchase_date)}</p>
                    <h3 className="mt-1 text-[15px] font-semibold">{record.item_name}</h3>
                    <p className="mt-1 text-sm text-ink/62">
                      {record.purchase_source?.name ?? "-"} / {record.sales_channel?.name ?? "-"}
                    </p>
                  </div>
                  <StatusBadge tone={record.is_completed ? "success" : "warning"}>
                    {record.is_completed ? "完了" : "見込み"}
                  </StatusBadge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-ink/52">仕入額</p>
                    <p className="mt-1 font-semibold">{formatCurrency(record.purchase_amount)}</p>
                  </div>
                  <div>
                    <p className="text-ink/52">利益</p>
                    <p className="mt-1 font-semibold">{formatCurrency(calculateResaleProfit(record))}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/88 px-3 py-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      checked={record.is_completed}
                      onChange={(event) => {
                        startTransition(async () => {
                          try {
                            await toggleResaleTransactionCompleted(record.id, event.target.checked);
                            router.refresh();
                          } catch (error) {
                            setFeedback(error instanceof Error ? error.message : "更新に失敗しました。");
                          }
                        });
                      }}
                    />
                    完了
                  </label>
                  <Button type="button" variant="secondary" className="px-3 py-2" onClick={() => setEditingId(record.id)}>
                    編集
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-3 py-2"
                    onClick={() => {
                      startTransition(async () => {
                        try {
                          await deleteResaleTransaction(record.id);
                          if (editingId === record.id) {
                            setEditingId(null);
                            form.reset(createEmptyValues());
                          }
                          router.refresh();
                        } catch (error) {
                          setFeedback(error instanceof Error ? error.message : "削除に失敗しました。");
                        }
                      });
                    }}
                  >
                    削除
                  </Button>
                </div>
              </div>
            ))}
            {visibleRecords.length === 0 ? <p className="text-sm text-ink/60">該当データがありません。</p> : null}
          </div>

          <div className="mt-4 hidden overflow-hidden rounded-[28px] border border-black/5 md:block">
            <div className="grid grid-cols-[0.92fr,1.45fr,1fr,1fr,0.88fr,0.88fr,0.76fr,1.2fr] gap-3 bg-canvas/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/55">
              <span>仕入日</span>
              <span>商品名</span>
              <span>仕入先</span>
              <span>販売先</span>
              <span>仕入額</span>
              <span>利益</span>
              <span>状態</span>
              <span>操作</span>
            </div>
            <div className="divide-y divide-black/5 text-sm">
              {visibleRecords.map((record) => (
                <div
                  key={record.id}
                  className={[
                    "grid grid-cols-[0.92fr,1.45fr,1fr,1fr,0.88fr,0.88fr,0.76fr,1.2fr] gap-3 px-4 py-3.5",
                    record.is_completed ? "bg-emerald-50/55" : "bg-white/72",
                  ].join(" ")}
                >
                  <span>{formatDate(record.purchase_date)}</span>
                  <span>{record.item_name}</span>
                  <span>{record.purchase_source?.name ?? "-"}</span>
                  <span>{record.sales_channel?.name ?? "-"}</span>
                  <span className="font-medium">{formatCurrency(record.purchase_amount)}</span>
                  <span className="font-medium">{formatCurrency(calculateResaleProfit(record))}</span>
                  <span>
                    <StatusBadge tone={record.is_completed ? "success" : "warning"}>{record.is_completed ? "完了" : "見込み"}</StatusBadge>
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-3 py-1.5 text-xs font-medium">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded"
                        checked={record.is_completed}
                        onChange={(event) => {
                          startTransition(async () => {
                            try {
                              await toggleResaleTransactionCompleted(record.id, event.target.checked);
                              router.refresh();
                            } catch (error) {
                              setFeedback(error instanceof Error ? error.message : "更新に失敗しました。");
                            }
                          });
                        }}
                      />
                      完了
                    </label>
                    <Button type="button" variant="secondary" className="px-3 py-1.5" onClick={() => setEditingId(record.id)}>
                      編集
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-3 py-1.5"
                      onClick={() => {
                        startTransition(async () => {
                          try {
                            await deleteResaleTransaction(record.id);
                            if (editingId === record.id) {
                              setEditingId(null);
                              form.reset(createEmptyValues());
                            }
                            router.refresh();
                          } catch (error) {
                            setFeedback(error instanceof Error ? error.message : "削除に失敗しました。");
                          }
                        });
                      }}
                    >
                      削除
                    </Button>
                  </span>
                </div>
              ))}
              {visibleRecords.length === 0 ? <div className="bg-white/72 px-4 py-8 text-sm text-ink/60">該当データがありません。</div> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="追加 / 編集" description="売却額と各種費用から利益を確認しながら登録できます。">
          <div className="mb-4 rounded-[22px] border border-accent/10 bg-accentSoft p-3.5 text-sm text-accent">
            現在の利益プレビュー: <span className="font-semibold">{formatCurrency(previewProfit)}</span>
          </div>

          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="仕入日" required error={form.formState.errors.purchase_date?.message}>
                <Input type="date" {...form.register("purchase_date")} />
              </Field>
              <Field label="商品名" required error={form.formState.errors.item_name?.message}>
                <Input {...form.register("item_name")} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="仕入先区分" required error={form.formState.errors.purchase_source_id?.message}>
                <Select {...form.register("purchase_source_id")}>
                  <option value="">選択してください</option>
                  {purchaseSources.filter((item) => item.is_active || item.id === editingRecord?.purchase_source_id).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="販売先区分" required error={form.formState.errors.sales_channel_id?.message}>
                <Select {...form.register("sales_channel_id")}>
                  <option value="">選択してください</option>
                  {salesChannels.filter((item) => item.is_active || item.id === editingRecord?.sales_channel_id).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="仕入先メモ" error={form.formState.errors.purchase_source_note?.message}>
                <Input {...form.register("purchase_source_note")} />
              </Field>
              <Field label="販売先メモ" error={form.formState.errors.sales_channel_note?.message}>
                <Input {...form.register("sales_channel_note")} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="仕入額" required error={form.formState.errors.purchase_amount?.message}>
                <Input type="number" min="0" step="1" {...form.register("purchase_amount")} />
              </Field>
              <Field label="売却額" error={form.formState.errors.sale_amount?.message}>
                <Input type="number" min="0" step="1" {...form.register("sale_amount")} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="売却日" error={form.formState.errors.sale_date?.message}>
                <Input type="date" {...form.register("sale_date")} />
              </Field>
              <Field label="仕入値引き分" required error={form.formState.errors.discount_amount?.message}>
                <Input type="number" min="0" step="1" {...form.register("discount_amount")} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="送料" required error={form.formState.errors.shipping_fee?.message}>
                <Input type="number" min="0" step="1" {...form.register("shipping_fee")} />
              </Field>
              <Field label="手数料" required error={form.formState.errors.fee_amount?.message}>
                <Input type="number" min="0" step="1" {...form.register("fee_amount")} />
              </Field>
              <Field label="その他経費" required error={form.formState.errors.other_expense?.message}>
                <Input type="number" min="0" step="1" {...form.register("other_expense")} />
              </Field>
            </div>

            <label className="flex items-center gap-3 rounded-[20px] bg-canvas/70 px-4 py-3 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded" {...form.register("is_completed")} />
              売却完了として扱う
            </label>

            <Field label="メモ" error={form.formState.errors.memo?.message}>
              <Textarea {...form.register("memo")} />
            </Field>

            {feedback ? <p className="text-sm text-ink/70">{feedback}</p> : null}

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
    </div>
  );
}
