import { EditSubcategoryPage } from "@/modules/subcategories/components/edit-subcategory-page";
import { SubcategoryNotFound } from "@/modules/subcategories/components/subcategory-not-found";
import { categoriesApi } from "@/modules/categories/api/categories.api";
import { subcategoriesApi } from "@/modules/subcategories/api/subcategories.api";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface EditSubcategoryRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSubcategoryRoutePage({
  params,
}: EditSubcategoryRoutePageProps) {
  const { id } = await params;

  try {
    const [subcategoryResponse, categoriesResponse] = await Promise.all([
      subcategoriesApi.getById(id, { per_page: 100 }),
      categoriesApi.list({ per_page: 100 }),
    ]);

    const categories = categoriesResponse.data.categories.map((category) => ({
      id: category.id,
      title: category.title,
    }));

    return (
      <EditSubcategoryPage
        subcategory={subcategoryResponse.data.subcategory}
        categories={categories}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <SubcategoryNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Edit Subcategory</h1>
          <p className="text-sm text-muted-foreground">
            Update subcategory details and media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load this subcategory. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
