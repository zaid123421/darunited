import { ProductsListClient } from "@/modules/products/components/products-list-client";
import type { ProductListData } from "@/modules/products/types";

interface ProductsListPageProps {
  data: ProductListData;
}

export function ProductsListPage({ data }: ProductsListPageProps) {
  return <ProductsListClient initialData={data} />;
}
