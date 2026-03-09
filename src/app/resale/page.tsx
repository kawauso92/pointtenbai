import { PageHeader } from "@/components/page-header";
import { ResaleManager } from "@/features/resale/resale-manager";
import { getResalePageData } from "@/lib/data";

export default async function ResalePage() {
  const data = await getResalePageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resale"
        title="転売管理"
        description="仕入先区分と販売先区分を使って、売却完了までの利益管理を行います。"
      />
      <ResaleManager {...data} />
    </div>
  );
}