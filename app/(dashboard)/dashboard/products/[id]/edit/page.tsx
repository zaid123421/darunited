import { EditProductPage } from "@/modules/products/components/edit-product-page";
import { ProductNotFound } from "@/modules/products/components/product-not-found";
import { productsApi } from "@/modules/products/api/products.api";
import { categoriesApi } from "@/modules/categories/api/categories.api";
import { subcategoriesApi } from "@/modules/subcategories/api/subcategories.api";
import type { CategoryOption, SubCategoryOption } from "@/modules/products/types";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface EditProductRoutePageProps {
  params: Promise<{ id: string }>;
}

async function loadCategoriesAndSubcategories(): Promise<{
  categories: CategoryOption[];
  subCategories: SubCategoryOption[];
}> {
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
}

export default async function EditProductRoutePage({
  params,
}: EditProductRoutePageProps) {
  const { id } = await params;

  try {
    const [productResponse, { categories, subCategories }] = await Promise.all([
      productsApi.getById(id),
      loadCategoriesAndSubcategories(),
    ]);

    return (
      <EditProductPage
        product={productResponse.data.product}
        categories={categories}
        subCategories={subCategories}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <ProductNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Edit Product</h1>
          <p className="text-sm text-muted-foreground">
            Update product details and media.
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
