import { PageHeader } from "@/components/page-header";
import { MobileLineManager } from "@/features/mobile-lines/mobile-line-manager";
import { getMobileLinePageData } from "@/lib/data";

export default async function MobileLinesPage() {
  const data = await getMobileLinePageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mobile Lines"
        title="回線管理"
        description="案件回線と通常回線を分けて登録し、月額履歴を含めたコストと利益を管理できます。"
      />
      <MobileLineManager {...data} />
    </div>
  );
}
