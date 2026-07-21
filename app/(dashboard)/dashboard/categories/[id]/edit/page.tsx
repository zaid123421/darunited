import { EditCategoryPage } from "@/modules/categories/components/edit-category-page";
import { CategoryNotFound } from "@/modules/categories/components/category-not-found";
import { categoriesApi } from "@/modules/categories/api/categories.api";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface EditCategoryRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryRoutePage({
  params,
}: EditCategoryRoutePageProps) {
  const { id } = await params;

  try {
    const response = await categoriesApi.getById(id, { per_page: 100 });
    return <EditCategoryPage category={response.data.category} />;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <CategoryNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Edit Category</h1>
          <p className="text-sm text-muted-foreground">
            Update category details and media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load this category. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
