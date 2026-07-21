import { SubcategoriesListClient } from "@/modules/subcategories/components/subcategories-list-client";
import type { SubcategoryListData } from "@/modules/subcategories/types";

interface SubcategoriesListPageProps {
  data: SubcategoryListData;
}

export function SubcategoriesListPage({ data }: SubcategoriesListPageProps) {
  return <SubcategoriesListClient initialData={data} />;
}
