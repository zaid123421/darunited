import { ShowSubcategoryPage } from "@/modules/subcategories/components/show-subcategory-page";
import { SubcategoryNotFound } from "@/modules/subcategories/components/subcategory-not-found";
import { subcategoriesApi } from "@/modules/subcategories/api/subcategories.api";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface ShowSubcategoryRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function ShowSubcategoryRoutePage({
  params,
}: ShowSubcategoryRoutePageProps) {
  const { id } = await params;

  try {
    const response = await subcategoriesApi.getById(id);

    return (
      <ShowSubcategoryPage subcategory={response.data.subCategory} />
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <SubcategoryNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Subcategory Details</h1>
          <p className="text-sm text-muted-foreground">
            View subcategory information and media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load this subcategory. Please refresh the page or try again
            later.
          </p>
        </Card>
      </div>
    );
  }
}
