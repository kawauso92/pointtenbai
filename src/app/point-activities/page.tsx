import { PageHeader } from "@/components/page-header";
import { PointActivityManager } from "@/features/point-activities/point-activity-manager";
import { getPointActivityPageData } from "@/lib/data";

export default async function PointActivitiesPage() {
  const data = await getPointActivityPageData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Point Activities"
        title="ポイ活管理"
        description="ポイントサイトの案件を登録し、見込み報酬と確定報酬を整理できます。"
      />
      <PointActivityManager {...data} />
    </div>
  );
}
