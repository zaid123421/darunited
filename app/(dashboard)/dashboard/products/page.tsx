import { ProductsListPage } from "@/modules/products/components/products-list-page";
import { productsApi } from "@/modules/products/api/products.api";
import { categoriesApi } from "@/modules/categories/api/categories.api";
import { subcategoriesApi } from "@/modules/subcategories/api/subcategories.api";
import { hasActiveProductFilters } from "@/modules/products/lib/build-products-list-path";
import type { CategoryOption, SubCategoryOption } from "@/modules/products/types";
import { Card } from "@/shared/components/ui/card";

interface DashboardProductsPageProps {
  searchParams: Promise<{
    page?: string;
    title?: string;
    description?: string;
    categoryIds?: string;
    subCategoryIds?: string;
  }>;
}

async function loadCategoriesAndSubcategories(): Promise<{
  categories: CategoryOption[];
  subCategories: SubCategoryOption[];
}> {
  try {
    const [catsResponse, subCatsResponse] = await Promise.all([
      categoriesApi.list({ per_page: 100 }),
      subcategoriesApi.list({ per_page: 100 }),
    ]);

    const categories = catsResponse.data.categories.map((cat) => ({
      id: cat.id,
      title: cat.title,
    }));

    const subCategories = subCatsResponse.data.subCategories
      .filter((sc) => sc.category?.id !== undefined)
      .map((sc) => ({
        id: sc.id,
        title: sc.title,
        categoryId: sc.category!.id,
      }));

    return { categories, subCategories };
  } catch {
    return { categories: [], subCategories: [] };
  }
}

export default async function DashboardProductsPage({
  searchParams,
}: DashboardProductsPageProps) {
  const { page: pageParam, title, description, categoryIds, subCategoryIds } =
    await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const filters = { title, description, categoryIds, subCategoryIds };
  const isSearchActive = hasActiveProductFilters(filters);

  const [{ categories, subCategories }] = await Promise.all([
    loadCategoriesAndSubcategories(),
  ]);

  try {
    const response = isSearchActive
      ? await productsApi.search({
          page,
          title: filters.title,
          description: filters.description,
          categoryIds: filters.categoryIds,
          subCategoryIds: filters.subCategoryIds,
        })
      : await productsApi.list({ page });

    return (
      <ProductsListPage
        data={response.data}
        categories={categories}
        subCategories={subCategories}
        filters={filters}
        isSearchActive={isSearchActive}
      />
    );
  } catch (error) {
    console.error("[dashboard/products] load failed:", error);
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage product offerings and related media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load products. Please refresh the page or try again later.
          </p>
          {process.env.NODE_ENV !== "production" && error instanceof Error ? (
            <p className="mt-2 text-xs text-destructive/80">{error.message}</p>
          ) : null}
        </Card>
      </div>
    );
  }
}
