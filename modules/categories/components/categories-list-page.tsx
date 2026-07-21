import { CategoriesListClient } from "@/modules/categories/components/categories-list-client";
import type { CategoryListData } from "@/modules/categories/types";

interface CategoriesListPageProps {
  data: CategoryListData;
}

export function CategoriesListPage({ data }: CategoriesListPageProps) {
  return <CategoriesListClient initialData={data} />;
}
