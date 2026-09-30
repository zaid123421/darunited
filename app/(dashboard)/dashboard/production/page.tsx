import { ProductionSectionsListClient } from "@/modules/production/components/production-sections-list-client";
import { productionApi } from "@/modules/production/api/production.api";
import { Card } from "@/shared/components/ui/card";

interface DashboardProductionPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DashboardProductionPage({
  searchParams,
}: DashboardProductionPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  try {
    const response = await productionApi.list({ page, per_page: 12 });
    return <ProductionSectionsListClient initialData={response.data} />;
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Production</h1>
          <p className="page-subtitle mt-1">
            Manage production sections, features, and media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load production sections. Please try again later.
          </p>
        </Card>
      </div>
    );
  }
}
