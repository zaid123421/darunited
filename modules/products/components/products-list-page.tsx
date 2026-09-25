import { ProductsListClient } from "@/modules/products/components/products-list-client";
import type { ProductSearchFilters } from "@/modules/products/components/products-search-form";
import type { CategoryOption, ProductListData, SubCategoryOption } from "@/modules/products/types";

interface ProductsListPageProps {
  data: ProductListData;
  categories: CategoryOption[];
  subCategories: SubCategoryOption[];
  filters: ProductSearchFilters;
  isSearchActive: boolean;
}

export function ProductsListPage({
  data,
  categories,
  subCategories,
  filters,
  isSearchActive,
}: ProductsListPageProps) {
  return (
    <ProductsListClient
      initialData={data}
      categories={categories}
      subCategories={subCategories}
      filters={filters}
      isSearchActive={isSearchActive}
    />
  );
}
