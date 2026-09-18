import { ShowCategoryPage } from "@/modules/categories/components/show-category-page";
import { CategoryNotFound } from "@/modules/categories/components/category-not-found";
import { categoriesApi } from "@/modules/categories/api/categories.api";
import type { SubcategoryListData } from "@/modules/subcategories/types";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface ShowCategoryRoutePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

const EMPTY_SUBCATEGORIES: SubcategoryListData = {
  subCategories: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: null,
    to: null,
    has_more: false,
  },
};

export default async function ShowCategoryRoutePage({
  params,
  searchParams,
}: ShowCategoryRoutePageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  try {
    const categoryResponse = await categoriesApi.getById(id);

    let subcategories = EMPTY_SUBCATEGORIES;
    let subcategoriesLoadError = false;

    try {
      const subcategoriesResponse = await categoriesApi.getSubcategories(id, {
        page,
      });
      subcategories = {
        subCategories: subcategoriesResponse.data.subCategories,
        pagination: subcategoriesResponse.data.pagination,
      };
    } catch {
      subcategoriesLoadError = true;
    }

    return (
      <ShowCategoryPage
        category={categoryResponse.data.category}
        subcategories={subcategories}
        subcategoriesLoadError={subcategoriesLoadError}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <CategoryNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Category Details</h1>
          <p className="text-sm text-muted-foreground">
            View category information.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load this category. Please refresh the page or try again
            later.
          </p>
        </Card>
      </div>
    );
  }
}
