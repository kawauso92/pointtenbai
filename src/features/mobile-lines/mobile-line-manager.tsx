"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  deleteMobileLine,
  saveMobileLine,
  toggleMobileLineCancelled,
  toggleMobileLineCompleted,
} from "@/app/actions/mobile-lines";
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
  computeMobileLineSummary,
  filterMobileLinesByTab,
  getMobileLineTabCounts,
} from "@/lib/analytics";
import { calculateMobileLineProfit, calculateMobileLineTotalCost } from "@/lib/calculations";
import { contractStatusOptions, lineTypeOptions } from "@/lib/constants";
import type { CarrierOption, MobileLineRow } from "@/lib/data";
import { formatCurrency, formatDate, maskPhoneNumber, parseNumberInput } from "@/lib/utils";
import { mobileLineFormSchema, type MobileLineFormValues } from "@/lib/validation/forms";

type MobileLineManagerProps = {
  isConfigured: boolean;
  carriers: CarrierOption[];
  mobileLines: MobileLineRow[];
};

function createEmptyValues(): MobileLineFormValues {
  return {
    contract_date: "",
    line_type: "campaign",
    carrier_id: "",
    phone_number: "",
    registered_email: "",
    management_id: "",
    title: "",
    reward_amount: "",
    initial_cost: "0",
    cancellation_cost: "0",
    cancellation_date: "",
    completed_date: "",
    contract_status: "active",
    device_name: "",
    return_due_date: "",
    returned_date: "",
    is_completed: false,
    memo: "",
    monthly_costs: [],
  };
}

function toFormValues(record: MobileLineRow): MobileLineFormValues {
  return {
    id: record.id,
    contract_date: record.contract_date,
    line_type: record.line_type,
    carrier_id: record.carrier_id,
    phone_number: record.phone_number,
    registered_email: record.registered_email ?? "",
    management_id: record.management_id ?? "",
    title: record.title,
    reward_amount: record.reward_amount === null ? "" : String(record.reward_amount),
    initial_cost: String(record.initial_cost),
    cancellation_cost: String(record.cancellation_cost),
    cancellation_date: record.cancellation_date ?? "",
    completed_date: record.completed_date ?? "",
    contract_status: record.contract_status,
    device_name: record.device_name ?? "",
    return_due_date: record.return_due_date ?? "",
    returned_date: record.returned_date ?? "",
    is_completed: record.is_completed,
    memo: record.memo ?? "",
    monthly_costs: (record.monthly_costs ?? []).map((cost) => ({
      id: cost.id,
      start_date: cost.start_date,
      end_date: cost.end_date ?? "",
      monthly_fee: String(cost.monthly_fee),
      memo: cost.memo ?? "",
    })),
  };
}

export function MobileLineManager({ isConfigured, carriers, mobileLines }: MobileLineManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [isPending, startTransition] = useTransition();
  const editingRecord = mobileLines.find((record) => record.id === editingId) ?? null;
  const form = useForm<MobileLineFormValues>({
    resolver: zodResolver(mobileLineFormSchema),
    defaultValues: createEmptyValues(),
  });
  const fieldArray = useFieldArray({
    control: form.control,
    name: "monthly_costs",
  });
  const watched = form.watch();
  const previewCosts = (watched.monthly_costs ?? []).map((cost) => ({ monthly_fee: parseNumberInput(cost.monthly_fee) }));
  const totalCost = calculateMobileLineTotalCost(
    {
      initial_cost: parseNumberInput(watched.initial_cost),
      cancellation_cost: parseNumberInput(watched.cancellation_cost),
    },
    previewCosts,
  );
  const profit = calculateMobileLineProfit(
    {
      reward_amount: watched.reward_amount ? parseNumberInput(watched.reward_amount) : null,
      initial_cost: parseNumberInput(watched.initial_cost),
      cancellation_cost: parseNumberInput(watched.cancellation_cost),
    },
    previewCosts,
  );
  const summaryItems = computeMobileLineSummary(mobileLines);
  const tabCounts = getMobileLineTabCounts(mobileLines);
  const visibleRecords = filterMobileLinesByTab(mobileLines, tab);

  useEffect(() => {
    form.reset(editingRecord ? toFormValues(editingRecord) : createEmptyValues());
  }, [editingRecord, form]);

  const onSubmit = form.handleSubmit((values) => {
    setFeedback(null);
    startTransition(async () => {
      try {
        await saveMobileLine(values);
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

      <div className="grid gap-5 xl:grid-cols-[1.18fr,0.82fr]">
        <SectionCard
          title="回線一覧"
          description="完了タブは解約済みのみです。特典完了だけではアクティブに残します。"
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
            {visibleRecords.map((record) => {
              const rowCosts = record.monthly_costs ?? [];
              const rowTotalCost = calculateMobileLineTotalCost(record, rowCosts);
              const rowProfit = calculateMobileLineProfit(record, rowCosts);
              const cardClass = record.contract_status === "cancelled"
                ? "border-slate-200 bg-slate-100/80"
                : record.is_completed
                  ? "border-emerald-100 bg-emerald-50/65"
                  : "border-black/5 bg-canvas/55";

              return (
                <div key={record.id} className={["rounded-[26px] border p-4", cardClass].join(" ")}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-ink/52">{formatDate(record.contract_date)}</p>
                      <h3 className="mt-1 text-[15px] font-semibold">{record.title}</h3>
                      <p className="mt-1 text-sm text-ink/62">
                        {record.carrier?.name ?? "-"} / {maskPhoneNumber(record.phone_number)}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {record.is_completed ? <StatusBadge tone="success">特典完了</StatusBadge> : null}
                      {record.contract_status === "cancelled" ? <StatusBadge tone="muted">解約済</StatusBadge> : null}
                      {!record.is_completed && record.contract_status !== "cancelled" ? <StatusBadge tone="warning">進行中</StatusBadge> : null}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-ink/52">総コスト</p>
                      <p className="mt-1 font-semibold">{formatCurrency(rowTotalCost)}</p>
                    </div>
                    <div>
                      <p className="text-ink/52">利益</p>
                      <p className="mt-1 font-semibold">{formatCurrency(rowProfit)}</p>
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
                              await toggleMobileLineCompleted(record.id, event.target.checked);
                              router.refresh();
                            } catch (error) {
                              setFeedback(error instanceof Error ? error.message : "更新に失敗しました。");
                            }
                          });
                        }}
                      />
                      特典
                    </label>
                    <label className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/88 px-3 py-2 text-xs font-medium">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded"
                        checked={record.contract_status === "cancelled"}
                        onChange={(event) => {
                          startTransition(async () => {
                            try {
                              await toggleMobileLineCancelled(record.id, event.target.checked);
                              router.refresh();
                            } catch (error) {
                              setFeedback(error instanceof Error ? error.message : "更新に失敗しました。");
                            }
                          });
                        }}
                      />
                      解約済
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
                            await deleteMobileLine(record.id);
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
              );
            })}
            {visibleRecords.length === 0 ? <p className="text-sm text-ink/60">該当データがありません。</p> : null}
          </div>

          <div className="mt-4 hidden overflow-hidden rounded-[28px] border border-black/5 md:block">
            <div className="grid grid-cols-[0.82fr,0.72fr,0.9fr,0.94fr,1.08fr,0.88fr,0.88fr,1.02fr,1.55fr] gap-3 bg-canvas/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/55">
              <span>契約日</span>
              <span>種別</span>
              <span>キャリア</span>
              <span>電話番号</span>
              <span>案件名</span>
              <span>総コスト</span>
              <span>利益</span>
              <span>状態</span>
              <span>操作</span>
            </div>
            <div className="divide-y divide-black/5 text-sm">
              {visibleRecords.map((record) => {
                const rowCosts = record.monthly_costs ?? [];
                const rowTotalCost = calculateMobileLineTotalCost(record, rowCosts);
                const rowProfit = calculateMobileLineProfit(record, rowCosts);
                const rowClass = record.contract_status === "cancelled"
                  ? "bg-slate-100/82"
                  : record.is_completed
                    ? "bg-emerald-50/55"
                    : "bg-white/72";

                return (
                  <div
                    key={record.id}
                    className={[
                      "grid grid-cols-[0.82fr,0.72fr,0.9fr,0.94fr,1.08fr,0.88fr,0.88fr,1.02fr,1.55fr] gap-3 px-4 py-3.5",
                      rowClass,
                    ].join(" ")}
                  >
                    <span>{formatDate(record.contract_date)}</span>
                    <span>{record.line_type === "campaign" ? "案件" : "通常"}</span>
                    <span>{record.carrier?.name ?? "-"}</span>
                    <span>{maskPhoneNumber(record.phone_number)}</span>
                    <span>{record.title}</span>
                    <span className="font-medium">{formatCurrency(rowTotalCost)}</span>
                    <span className="font-medium">{formatCurrency(rowProfit)}</span>
                    <span className="flex flex-wrap gap-2">
                      {record.is_completed ? <StatusBadge tone="success">特典完了</StatusBadge> : null}
                      {record.contract_status === "cancelled" ? <StatusBadge tone="muted">解約済</StatusBadge> : null}
                      {!record.is_completed && record.contract_status !== "cancelled" ? <StatusBadge tone="warning">進行中</StatusBadge> : null}
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
                                await toggleMobileLineCompleted(record.id, event.target.checked);
                                router.refresh();
                              } catch (error) {
                                setFeedback(error instanceof Error ? error.message : "更新に失敗しました。");
                              }
                            });
                          }}
                        />
                        特典
                      </label>
                      <label className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-3 py-1.5 text-xs font-medium">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded"
                          checked={record.contract_status === "cancelled"}
                          onChange={(event) => {
                            startTransition(async () => {
                              try {
                                await toggleMobileLineCancelled(record.id, event.target.checked);
                                router.refresh();
                              } catch (error) {
                                setFeedback(error instanceof Error ? error.message : "更新に失敗しました。");
                              }
                            });
                          }}
                        />
                        解約済
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
                              await deleteMobileLine(record.id);
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
                );
              })}
              {visibleRecords.length === 0 ? <div className="bg-white/72 px-4 py-8 text-sm text-ink/60">該当データがありません。</div> : null}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="追加 / 編集" description="特典完了と解約済を分けて管理し、月額履歴から総コストと利益を計算します。">
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] border border-accent/10 bg-accentSoft p-3.5 text-sm text-accent">
              総コストプレビュー: <span className="font-semibold">{formatCurrency(totalCost)}</span>
            </div>
            <div className="rounded-[22px] border border-black/5 bg-sand/65 p-3.5 text-sm text-ink/75">
              利益プレビュー: <span className="font-semibold">{formatCurrency(profit)}</span>
            </div>
          </div>

          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="契約日" required error={form.formState.errors.contract_date?.message}>
                <Input type="date" {...form.register("contract_date")} />
              </Field>
              <Field label="回線種別" required error={form.formState.errors.line_type?.message}>
                <Select {...form.register("line_type")}>
                  {lineTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="キャリア" required error={form.formState.errors.carrier_id?.message}>
                <Select {...form.register("carrier_id")}>
                  <option value="">選択してください</option>
                  {carriers.filter((item) => item.is_active || item.id === editingRecord?.carrier_id).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="電話番号" required error={form.formState.errors.phone_number?.message}>
                <Input {...form.register("phone_number")} placeholder="09012345678" />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="登録メール" error={form.formState.errors.registered_email?.message}>
                <Input {...form.register("registered_email")} />
              </Field>
              <Field label="管理ID" error={form.formState.errors.management_id?.message}>
                <Input {...form.register("management_id")} />
              </Field>
            </div>

            <Field label="案件名" required error={form.formState.errors.title?.message}>
              <Input {...form.register("title")} />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="報酬額" error={form.formState.errors.reward_amount?.message}>
                <Input type="number" min="0" step="1" {...form.register("reward_amount")} />
              </Field>
              <Field label="初期費用" required error={form.formState.errors.initial_cost?.message}>
                <Input type="number" min="0" step="1" {...form.register("initial_cost")} />
              </Field>
              <Field label="解約費用" required error={form.formState.errors.cancellation_cost?.message}>
                <Input type="number" min="0" step="1" {...form.register("cancellation_cost")} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="解約日" error={form.formState.errors.cancellation_date?.message}>
                <Input type="date" {...form.register("cancellation_date")} />
              </Field>
              <Field label="特典完了日" error={form.formState.errors.completed_date?.message}>
                <Input type="date" {...form.register("completed_date")} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="契約ステータス" required error={form.formState.errors.contract_status?.message}>
                <Select {...form.register("contract_status")}>
                  {contractStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              </Field>
              <Field label="端末名" error={form.formState.errors.device_name?.message}>
                <Input {...form.register("device_name")} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="返却期限" error={form.formState.errors.return_due_date?.message}>
                <Input type="date" {...form.register("return_due_date")} />
              </Field>
              <Field label="返却完了日" error={form.formState.errors.returned_date?.message}>
                <Input type="date" {...form.register("returned_date")} />
              </Field>
            </div>

            <label className="flex items-center gap-3 rounded-[20px] bg-canvas/70 px-4 py-3 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded" {...form.register("is_completed")} />
              特典完了として扱う
            </label>

            <Field label="メモ" error={form.formState.errors.memo?.message}>
              <Textarea {...form.register("memo")} />
            </Field>

            <div className="rounded-[26px] border border-black/5 bg-canvas/45 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">月額履歴</h3>
                  <p className="text-sm text-ink/60">日割りはせず、登録済み monthly_fee の合計で扱います。</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fieldArray.append({ start_date: "", end_date: "", monthly_fee: "0", memo: "" })}
                >
                  行追加
                </Button>
              </div>

              <div className="grid gap-3">
                {fieldArray.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-3 rounded-[22px] border border-black/5 bg-white/82 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <Field label="開始日" error={form.formState.errors.monthly_costs?.[index]?.start_date?.message}>
                        <Input type="date" {...form.register(`monthly_costs.${index}.start_date`)} />
                      </Field>
                      <Field label="終了日" error={form.formState.errors.monthly_costs?.[index]?.end_date?.message}>
                        <Input type="date" {...form.register(`monthly_costs.${index}.end_date`)} />
                      </Field>
                      <Field label="月額料金" error={form.formState.errors.monthly_costs?.[index]?.monthly_fee?.message}>
                        <Input type="number" min="0" step="1" {...form.register(`monthly_costs.${index}.monthly_fee`)} />
                      </Field>
                    </div>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Field label="メモ" error={form.formState.errors.monthly_costs?.[index]?.memo?.message}>
                          <Input {...form.register(`monthly_costs.${index}.memo`)} />
                        </Field>
                      </div>
                      <Button type="button" variant="ghost" onClick={() => fieldArray.remove(index)}>削除</Button>
                    </div>
                  </div>
                ))}
                {fieldArray.fields.length === 0 ? <p className="text-sm text-ink/60">月額履歴はまだありません。</p> : null}
              </div>
            </div>

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
