import { PageHeader } from "@/components/page-header";
import { ResaleManager } from "@/features/resale/resale-manager";
import { getResalePageData } from "@/lib/data";

type ResalePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResalePage({ searchParams }: ResalePageProps) {
  const data = await getResalePageData();
  const filters = await searchParams;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        eyebrow="Resale"
        title="転売管理"
        description="仕入先と販売先を紐づけながら、取引ごとの利益を管理できます。"
      />
      <ResaleManager {...data} initialFilters={filters} />
    </div>
  );
}
