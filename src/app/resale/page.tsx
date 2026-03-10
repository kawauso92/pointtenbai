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
        description="仕入先と販売先を紐づけながら、取引ごとの利益を管理できます。"
      />
      <ResaleManager {...data} />
    </div>
  );
}
