import { ShowCategoryPage } from "@/modules/categories/components/show-category-page";
import { CategoryNotFound } from "@/modules/categories/components/category-not-found";
import { categoriesApi } from "@/modules/categories/api/categories.api";
import { buildCategoryShowBasePath } from "@/modules/categories/lib/build-category-show-base-path";
import { getMainPicFromCategory } from "@/modules/categories/lib/category-media-mappers";
import type { CategoryMedia } from "@/modules/categories/types";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface ShowCategoryRoutePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ShowCategoryRoutePage({
  params,
  searchParams,
}: ShowCategoryRoutePageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const mediaPage = Math.max(1, Number(pageParam) || 1);

  try {
    const response = await categoriesApi.getById(id, { page: mediaPage, per_page: 10 });
    const category = response.data.category;

    let mainPic: CategoryMedia | undefined = getMainPicFromCategory(category);

    if (!mainPic && mediaPage !== 1) {
      const firstPageResponse = await categoriesApi.getById(id, { page: 1, per_page: 10 });
      mainPic = getMainPicFromCategory(firstPageResponse.data.category);
    }

    const mediaBasePath = buildCategoryShowBasePath(id);

    return (
      <ShowCategoryPage
        category={category}
        mainPic={mainPic}
        mediaBasePath={mediaBasePath}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <CategoryNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Category Details</h1>
          <p className="text-sm text-muted-foreground">
            View category information and media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load this category. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
