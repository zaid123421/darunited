import { ShowSubcategoryPage } from "@/modules/subcategories/components/show-subcategory-page";
import { SubcategoryNotFound } from "@/modules/subcategories/components/subcategory-not-found";
import { subcategoriesApi } from "@/modules/subcategories/api/subcategories.api";
import { buildSubcategoryShowBasePath } from "@/modules/subcategories/lib/build-subcategory-show-base-path";
import { getMainPicFromSubcategory } from "@/modules/subcategories/lib/subcategory-media-mappers";
import type { SubcategoryMedia } from "@/modules/subcategories/types";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface ShowSubcategoryRoutePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ShowSubcategoryRoutePage({
  params,
  searchParams,
}: ShowSubcategoryRoutePageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const mediaPage = Math.max(1, Number(pageParam) || 1);

  try {
    const response = await subcategoriesApi.getById(id, {
      page: mediaPage,
      per_page: 10,
    });
    const subcategory = response.data.subcategory;

    let mainPic: SubcategoryMedia | undefined =
      getMainPicFromSubcategory(subcategory);

    if (!mainPic && mediaPage !== 1) {
      const firstPageResponse = await subcategoriesApi.getById(id, {
        page: 1,
        per_page: 10,
      });
      mainPic = getMainPicFromSubcategory(firstPageResponse.data.subcategory);
    }

    const mediaBasePath = buildSubcategoryShowBasePath(id);

    return (
      <ShowSubcategoryPage
        subcategory={subcategory}
        mainPic={mainPic}
        mediaBasePath={mediaBasePath}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <SubcategoryNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Subcategory Details</h1>
          <p className="text-sm text-muted-foreground">
            View subcategory information and media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load this subcategory. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
