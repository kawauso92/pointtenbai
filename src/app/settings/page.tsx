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
        description="マスタ候補を追加・編集し、各画面で使う選択肢を管理できます。"
      />
      <SettingsManager {...data} />
    </div>
  );
}
