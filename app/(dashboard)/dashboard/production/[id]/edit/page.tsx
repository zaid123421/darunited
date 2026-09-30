import { EditProductionSectionPage } from "@/modules/production/components/edit-production-section-page";
import { productionApi } from "@/modules/production/api/production.api";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface EditProductionRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductionRoutePage({
  params,
}: EditProductionRoutePageProps) {
  const { id } = await params;

  try {
    const response = await productionApi.getById(id);
    return <EditProductionSectionPage section={response.data.section} />;
  } catch (error) {
    const message =
      error instanceof ApiError && error.statusCode === 404
        ? "This production section was not found."
        : "Unable to load this production section. Please try again later.";

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Edit Production Section</h1>
          <p className="page-subtitle mt-1">
            Update section details, features, and media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{message}</p>
        </Card>
      </div>
    );
  }
}
