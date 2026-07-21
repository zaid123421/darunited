import { ProductsListPage } from "@/modules/products/components/products-list-page";
import { productsApi } from "@/modules/products/api/products.api";
import { Card } from "@/shared/components/ui/card";

interface DashboardProductsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DashboardProductsPage({
  searchParams,
}: DashboardProductsPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  try {
    const response = await productsApi.list({ page });
    return <ProductsListPage data={response.data} />;
  } catch {
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
        </Card>
      </div>
    );
  }
}
