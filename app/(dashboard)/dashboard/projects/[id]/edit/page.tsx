import { EditProjectPage } from "@/modules/projects/components/edit-project-page";
import { ProjectNotFound } from "@/modules/projects/components/project-not-found";
import { projectsApi } from "@/modules/projects/api/projects.api";
import { servicesApi } from "@/modules/services/api/services.api";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface EditProjectRoutePageProps {
  params: Promise<{ id: string }>;
}

async function loadServices() {
  const response = await servicesApi.list({ per_page: 100 });
  return response.data.services.map((service) => ({
    id: service.id,
    title: service.title,
  }));
}

export default async function EditProjectRoutePage({
  params,
}: EditProjectRoutePageProps) {
  const { id } = await params;

  try {
    const [projectResponse, services] = await Promise.all([
      projectsApi.getById(id, { per_page: 100 }),
      loadServices(),
    ]);

    return (
      <EditProjectPage
        project={projectResponse.data.project}
        services={services}
      />
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <ProjectNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">
            Edit Project
          </h1>
          <p className="text-sm text-muted-foreground">
            Update project details and media.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load this project. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
