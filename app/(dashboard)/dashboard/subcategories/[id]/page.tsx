import { ShowSubcategoryPage } from "@/modules/subcategories/components/show-subcategory-page";
import { SubcategoryNotFound } from "@/modules/subcategories/components/subcategory-not-found";
import { subcategoriesApi } from "@/modules/subcategories/api/subcategories.api";
import { productsApi } from "@/modules/products/api/products.api";
import type { NestedProductsListData } from "@/modules/products/types";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface ShowSubcategoryRoutePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

const EMPTY_PRODUCTS: NestedProductsListData = {
  products: [],
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

export default async function ShowSubcategoryRoutePage({
  params,
  searchParams,
}: ShowSubcategoryRoutePageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const productsPage = Math.max(1, Number(pageParam) || 1);

  try {
    const subcategoryResponse = await subcategoriesApi.getById(id);

    let products = EMPTY_PRODUCTS;
    let productsLoadError = false;

    await productsApi
      .getBySubCategory(id, { page: productsPage })
      .then((response) => {
        products = {
          products: response.data.products,
          pagination: response.data.pagination,
        };
      })
      .catch(() => {
        productsLoadError = true;
      });

    return (
      <ShowSubcategoryPage
        subcategory={subcategoryResponse.data.subCategory}
        products={products}
        productsLoadError={productsLoadError}
      />
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
            Unable to load this subcategory. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
