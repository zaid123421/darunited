import { ShowProductPage } from "@/modules/products/components/show-product-page";
import { ProductNotFound } from "@/modules/products/components/product-not-found";
import { productsApi } from "@/modules/products/api/products.api";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface ShowProductRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function ShowProductRoutePage({
  params,
}: ShowProductRoutePageProps) {
  const { id } = await params;

  try {
    const response = await productsApi.getById(id);
    return <ShowProductPage product={response.data.product} />;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <ProductNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Product Details</h1>
          <p className="text-sm text-muted-foreground">
            View product information and media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load this product. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
