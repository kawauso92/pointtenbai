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
        description="ポイントサイト候補と案件情報を使って、見込み / 実利益の元データを管理します。"
      />
      <PointActivityManager {...data} />
    </div>
  );
}