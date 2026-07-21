import { SubcategoriesListPage } from "@/modules/subcategories/components/subcategories-list-page";
import { subcategoriesApi } from "@/modules/subcategories/api/subcategories.api";
import { Card } from "@/shared/components/ui/card";

interface DashboardSubcategoriesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DashboardSubcategoriesPage({
  searchParams,
}: DashboardSubcategoriesPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  try {
    const response = await subcategoriesApi.list({ page });
    return <SubcategoriesListPage data={response.data} />;
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Subcategories</h1>
          <p className="text-sm text-muted-foreground">
            Manage subcategory offerings and related media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load subcategories. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
