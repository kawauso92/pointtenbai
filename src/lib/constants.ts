export const lineTypeOptions = [
  { value: "campaign", label: "案件回線" },
  { value: "normal", label: "通常利用回線" },
] as const;

export const contractStatusOptions = [
  { value: "active", label: "維持中" },
  { value: "cancelled", label: "解約済" },
] as const;

export const settingsCategoryMeta = {
  point_sites: { label: "ポイントサイト" },
  purchase_sources: { label: "仕入先区分" },
  sales_channels: { label: "販売先区分" },
  carriers: { label: "キャリア" },
} as const;

export const appName = "ポイ活・転売・回線管理アプリ";