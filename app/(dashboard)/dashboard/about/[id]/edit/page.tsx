import { EditAboutSectionPage } from "@/modules/about/components/edit-about-section-page";
import { aboutApi } from "@/modules/about/api/about.api";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface EditAboutRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAboutRoutePage({
  params,
}: EditAboutRoutePageProps) {
  const { id } = await params;

  try {
    const response = await aboutApi.getById(id);
    return <EditAboutSectionPage section={response.data.section} />;
  } catch (error) {
    const message =
      error instanceof ApiError && error.statusCode === 404
        ? "This about us section was not found."
        : "Unable to load this about us section. Please try again later.";

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Edit About Section</h1>
          <p className="page-subtitle mt-1">Update section details and media.</p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{message}</p>
        </Card>
      </div>
    );
  }
}
