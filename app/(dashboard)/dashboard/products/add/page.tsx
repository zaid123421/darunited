import { AddProductPage } from "@/modules/products/components/add-product-page";
import { categoriesApi } from "@/modules/categories/api/categories.api";
import { subcategoriesApi } from "@/modules/subcategories/api/subcategories.api";
import type { CategoryOption, SubCategoryOption } from "@/modules/products/types";
import { Card } from "@/shared/components/ui/card";

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

export default async function DashboardAddProductPage() {
  try {
    const { categories, subCategories } = await loadCategoriesAndSubcategories();
    return <AddProductPage categories={categories} subCategories={subCategories} />;
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Add Product</h1>
          <p className="text-sm text-muted-foreground">
            Create a new product offering.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load categories. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
