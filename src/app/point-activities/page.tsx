import { PageHeader } from "@/components/page-header";
import { PointActivityManager } from "@/features/point-activities/point-activity-manager";
import { getPointActivityPageData } from "@/lib/data";

type PointActivitiesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PointActivitiesPage({ searchParams }: PointActivitiesPageProps) {
  const data = await getPointActivityPageData();
  const filters = await searchParams;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        eyebrow="Point Activities"
        title="ポイ活管理"
        description="ポイントサイトの案件を登録し、見込み報酬と確定報酬を整理できます。"
      />
      <PointActivityManager {...data} initialFilters={filters} />
    </div>
  );
}
