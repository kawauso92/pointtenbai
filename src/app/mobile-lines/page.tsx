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
        description="案件回線と通常回線を分けつつ、月額履歴も含めて一体で管理します。"
      />
      <MobileLineManager {...data} />
    </div>
  );
}