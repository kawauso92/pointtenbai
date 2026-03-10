import { ConfigurationNotice } from "@/components/configuration-notice";
import { PageHeader } from "@/components/page-header";
import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { getDashboardPageData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getDashboardPageData();

  return (
    <div className="space-y-4 md:space-y-5">
      <PageHeader
        eyebrow="Dashboard"
        title="利益ダッシュボード"
        description="期間を切り替えながら、実利益と見込みをカテゴリ別・月別に俯瞰できます。"
      />

      {!data.isConfigured ? <ConfigurationNotice /> : null}

      <DashboardOverview {...data} />
    </div>
  );
}
