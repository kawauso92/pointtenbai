import { PageHeader } from "@/components/page-header";
import { SettingsManager } from "@/features/settings/settings-manager";
import { getSettingsPageData } from "@/lib/data";

export default async function SettingsPage() {
  const data = await getSettingsPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="設定"
        description="マスタ候補は削除せず、有効 / 無効フラグと並び順で管理します。"
      />
      <SettingsManager {...data} />
    </div>
  );
}