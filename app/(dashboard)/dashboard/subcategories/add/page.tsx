import { AddSubcategoryPage } from "@/modules/subcategories/components/add-subcategory-page";
import { categoriesApi } from "@/modules/categories/api/categories.api";
import { Card } from "@/shared/components/ui/card";

interface DashboardAddSubcategoryPageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

export default async function DashboardAddSubcategoryPage({
  searchParams,
}: DashboardAddSubcategoryPageProps) {
  const { categoryId: categoryIdParam } = await searchParams;
  const defaultCategoryId = Number(categoryIdParam);
  const resolvedDefaultCategoryId =
    Number.isFinite(defaultCategoryId) && defaultCategoryId > 0
      ? defaultCategoryId
      : undefined;

  try {
    const response = await categoriesApi.list({ per_page: 100 });
    const categories = response.data.categories.map((category) => ({
      id: category.id,
      title: category.title,
    }));

    return (
      <AddSubcategoryPage
        categories={categories}
        defaultCategoryId={resolvedDefaultCategoryId}
      />
    );
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Add Subcategory</h1>
          <p className="text-sm text-muted-foreground">
            Create a new subcategory offering.
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
