import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const numberPattern = /^\d+(\.\d{1,2})?$/;
const integerPattern = /^-?\d+$/;

function requiredMoney(message = "0以上の金額を入力してください") {
  return z
    .string()
    .trim()
    .min(1, "必須項目です")
    .refine((value) => numberPattern.test(value) && Number(value) >= 0, message);
}

function optionalMoney() {
  return z
    .string()
    .trim()
    .refine((value) => value === "" || (numberPattern.test(value) && Number(value) >= 0), "0以上の金額を入力してください");
}

function requiredDate() {
  return z
    .string()
    .trim()
    .min(1, "必須項目です")
    .refine((value) => datePattern.test(value), "YYYY-MM-DD 形式で入力してください");
}

function optionalDate() {
  return z
    .string()
    .trim()
    .refine((value) => value === "" || datePattern.test(value), "YYYY-MM-DD 形式で入力してください");
}

export const settingRecordSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "名称は必須です"),
  sort_order: z
    .string()
    .trim()
    .min(1, "並び順は必須です")
    .refine((value) => integerPattern.test(value), "整数で入力してください"),
  is_active: z.boolean().default(true),
});

export const pointActivityFormSchema = z.object({
  id: z.string().uuid().optional(),
  activity_date: requiredDate(),
  point_site_id: z.string().uuid("ポイントサイトを選択してください"),
  title: z.string().trim().min(1, "案件名は必須です"),
  reward_amount: requiredMoney(),
  is_completed: z.boolean().default(false),
  completed_date: optionalDate(),
  condition_note: z.string().trim().optional().default(""),
  inquiry_url: z.string().trim().refine((value) => value === "" || /^https?:\/\//.test(value), "URL 形式で入力してください"),
  memo: z.string().trim().optional().default(""),
});

export const resaleTransactionFormSchema = z.object({
  id: z.string().uuid().optional(),
  purchase_date: requiredDate(),
  item_name: z.string().trim().min(1, "商品名は必須です"),
  purchase_source_id: z.string().uuid("仕入先区分を選択してください"),
  purchase_source_note: z.string().trim().optional().default(""),
  sales_channel_id: z.string().uuid("販売先区分を選択してください"),
  sales_channel_note: z.string().trim().optional().default(""),
  purchase_amount: requiredMoney(),
  sale_amount: optionalMoney(),
  sale_date: optionalDate(),
  discount_amount: requiredMoney(),
  shipping_fee: requiredMoney(),
  fee_amount: requiredMoney(),
  other_expense: requiredMoney(),
  is_completed: z.boolean().default(false),
  memo: z.string().trim().optional().default(""),
});

export const mobileLineMonthlyCostSchema = z.object({
  id: z.string().uuid().optional(),
  start_date: requiredDate(),
  end_date: optionalDate(),
  monthly_fee: requiredMoney(),
  memo: z.string().trim().optional().default(""),
});

export const mobileLineFormSchema = z.object({
  id: z.string().uuid().optional(),
  contract_date: requiredDate(),
  line_type: z.enum(["campaign", "normal"]),
  carrier_id: z.string().uuid("キャリアを選択してください"),
  phone_number: z.string().trim().min(1, "電話番号は必須です"),
  registered_email: z.string().trim().optional().default(""),
  management_id: z.string().trim().optional().default(""),
  title: z.string().trim().min(1, "案件名は必須です"),
  reward_amount: optionalMoney(),
  initial_cost: requiredMoney(),
  cancellation_cost: requiredMoney(),
  cancellation_date: optionalDate(),
  completed_date: optionalDate(),
  contract_status: z.enum(["active", "cancelled"]),
  device_name: z.string().trim().optional().default(""),
  return_due_date: optionalDate(),
  returned_date: optionalDate(),
  is_completed: z.boolean().default(false),
  memo: z.string().trim().optional().default(""),
  monthly_costs: z.array(mobileLineMonthlyCostSchema).default([]),
});

export type SettingRecordFormValues = z.infer<typeof settingRecordSchema>;
export type PointActivityFormValues = z.infer<typeof pointActivityFormSchema>;
export type ResaleTransactionFormValues = z.infer<typeof resaleTransactionFormSchema>;
export type MobileLineMonthlyCostFormValues = z.infer<typeof mobileLineMonthlyCostSchema>;
export type MobileLineFormValues = z.infer<typeof mobileLineFormSchema>;
