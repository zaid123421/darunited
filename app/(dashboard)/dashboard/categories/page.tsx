import { CategoriesListPage } from "@/modules/categories/components/categories-list-page";
import { categoriesApi } from "@/modules/categories/api/categories.api";
import { Card } from "@/shared/components/ui/card";

interface DashboardCategoriesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DashboardCategoriesPage({
  searchParams,
}: DashboardCategoriesPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  try {
    const response = await categoriesApi.list({ page });
    return <CategoriesListPage data={response.data} />;
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage category offerings and related media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load categories. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
