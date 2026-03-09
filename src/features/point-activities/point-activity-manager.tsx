"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { deletePointActivity, savePointActivity, togglePointActivityCompleted } from "@/app/actions/point-activities";
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
  computePointActivitySummary,
  filterPointActivitiesByTab,
  getPointActivityTabCounts,
} from "@/lib/analytics";
import type { PointActivityRow, PointSiteOption } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { pointActivityFormSchema, type PointActivityFormValues } from "@/lib/validation/forms";

type PointActivityManagerProps = {
  isConfigured: boolean;
  pointSites: PointSiteOption[];
  pointActivities: PointActivityRow[];
};

function createEmptyValues(): PointActivityFormValues {
  return {
    activity_date: "",
    point_site_id: "",
    title: "",
    reward_amount: "0",
    is_completed: false,
    completed_date: "",
    condition_note: "",
    inquiry_url: "",
    memo: "",
  };
}

function toFormValues(record: PointActivityRow): PointActivityFormValues {
  return {
    id: record.id,
    activity_date: record.activity_date,
    point_site_id: record.point_site_id,
    title: record.title,
    reward_amount: String(record.reward_amount),
    is_completed: record.is_completed,
    completed_date: record.completed_date ?? "",
    condition_note: record.condition_note ?? "",
    inquiry_url: record.inquiry_url ?? "",
    memo: record.memo ?? "",
  };
}

export function PointActivityManager({ isConfigured, pointSites, pointActivities }: PointActivityManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [isPending, startTransition] = useTransition();
  const editingRecord = pointActivities.find((record) => record.id === editingId) ?? null;
  const form = useForm<PointActivityFormValues>({
    resolver: zodResolver(pointActivityFormSchema),
    defaultValues: createEmptyValues(),
  });
  const summaryItems = computePointActivitySummary(pointActivities);
  const tabCounts = getPointActivityTabCounts(pointActivities);
  const visibleRecords = filterPointActivitiesByTab(pointActivities, tab);

  useEffect(() => {
    form.reset(editingRecord ? toFormValues(editingRecord) : createEmptyValues());
  }, [editingRecord, form]);

  const onSubmit = form.handleSubmit((values) => {
    setFeedback(null);
    startTransition(async () => {
      try {
        await savePointActivity(values);
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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <SummaryStatCard key={item.label} {...item} className="min-h-[96px]" />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.08fr,0.92fr]">
        <SectionCard
          title="案件一覧"
          description="完了チェックを基準に、アクティブと完了を切り替えて管理します。"
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
                    <p className="text-sm text-ink/52">{formatDate(record.activity_date)}</p>
                    <h3 className="mt-1 text-[15px] font-semibold">{record.title}</h3>
                    <p className="mt-1 text-sm text-ink/62">{record.point_site?.name ?? "-"}</p>
                  </div>
                  <StatusBadge tone={record.is_completed ? "success" : "warning"}>
                    {record.is_completed ? "完了" : "見込み"}
                  </StatusBadge>
                </div>
                <p className="mt-4 text-xl font-semibold tracking-tight">{formatCurrency(record.reward_amount)}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/88 px-3 py-2 text-xs font-medium">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      checked={record.is_completed}
                      onChange={(event) => {
                        startTransition(async () => {
                          try {
                            await togglePointActivityCompleted(record.id, event.target.checked);
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
                          await deletePointActivity(record.id);
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
            <div className="grid grid-cols-[0.92fr,1fr,1.5fr,0.82fr,0.78fr,0.92fr,1.2fr] gap-3 bg-canvas/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/55">
              <span>実施日</span>
              <span>サイト</span>
              <span>案件名</span>
              <span>報酬</span>
              <span>状態</span>
              <span>完了日</span>
              <span>操作</span>
            </div>
            <div className="divide-y divide-black/5">
              {visibleRecords.map((record) => (
                <div
                  key={record.id}
                  className={[
                    "grid grid-cols-[0.92fr,1fr,1.5fr,0.82fr,0.78fr,0.92fr,1.2fr] gap-3 px-4 py-3.5 text-sm",
                    record.is_completed ? "bg-emerald-50/55" : "bg-white/72",
                  ].join(" ")}
                >
                  <span>{formatDate(record.activity_date)}</span>
                  <span>{record.point_site?.name ?? "-"}</span>
                  <span>{record.title}</span>
                  <span className="font-medium">{formatCurrency(record.reward_amount)}</span>
                  <span>
                    <StatusBadge tone={record.is_completed ? "success" : "warning"}>{record.is_completed ? "完了" : "見込み"}</StatusBadge>
                  </span>
                  <span>{formatDate(record.completed_date)}</span>
                  <span className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/90 px-3 py-1.5 text-xs font-medium">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded"
                        checked={record.is_completed}
                        onChange={(event) => {
                          startTransition(async () => {
                            try {
                              await togglePointActivityCompleted(record.id, event.target.checked);
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
                            await deletePointActivity(record.id);
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

        <SectionCard title="追加 / 編集" description="完了チェックありを実利益、なしを見込みとして扱います。">
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="実施日" required error={form.formState.errors.activity_date?.message}>
                <Input type="date" {...form.register("activity_date")} />
              </Field>
              <Field label="ポイントサイト" required error={form.formState.errors.point_site_id?.message}>
                <Select {...form.register("point_site_id")}>
                  <option value="">選択してください</option>
                  {pointSites.filter((site) => site.is_active || site.id === editingRecord?.point_site_id).map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="案件名" required error={form.formState.errors.title?.message}>
              <Input {...form.register("title")} placeholder="案件名を入力" />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="報酬額" required error={form.formState.errors.reward_amount?.message}>
                <Input type="number" min="0" step="1" {...form.register("reward_amount")} />
              </Field>
              <Field label="完了日" error={form.formState.errors.completed_date?.message}>
                <Input type="date" {...form.register("completed_date")} />
              </Field>
            </div>

            <label className="flex items-center gap-3 rounded-[20px] bg-canvas/70 px-4 py-3 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded" {...form.register("is_completed")} />
              完了済として扱う
            </label>

            <Field label="条件メモ" error={form.formState.errors.condition_note?.message}>
              <Textarea {...form.register("condition_note")} />
            </Field>

            <Field label="問い合わせリンク" error={form.formState.errors.inquiry_url?.message}>
              <Input {...form.register("inquiry_url")} placeholder="https://..." />
            </Field>

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
