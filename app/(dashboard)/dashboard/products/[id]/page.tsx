import { ShowProductPage } from "@/modules/products/components/show-product-page";
import { ProductNotFound } from "@/modules/products/components/product-not-found";
import { productsApi } from "@/modules/products/api/products.api";
import { buildProductShowBasePath } from "@/modules/products/lib/build-product-show-base-path";
import { getMainPicFromProduct } from "@/modules/products/lib/product-media-mappers";
import type { ProductMedia } from "@/modules/products/types";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface ShowProductRoutePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ShowProductRoutePage({
  params,
  searchParams,
}: ShowProductRoutePageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const mediaPage = Math.max(1, Number(pageParam) || 1);

  try {
    const response = await productsApi.getById(id, { page: mediaPage, per_page: 10 });
    const product = response.data.product;

    let mainPic: ProductMedia | undefined = getMainPicFromProduct(product);

    if (!mainPic && mediaPage !== 1) {
      const firstPageResponse = await productsApi.getById(id, { page: 1, per_page: 10 });
      mainPic = getMainPicFromProduct(firstPageResponse.data.product);
    }

    const mediaBasePath = buildProductShowBasePath(id);

    return (
      <ShowProductPage
        product={product}
        mainPic={mainPic}
        mediaBasePath={mediaBasePath}
      />
    );
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
