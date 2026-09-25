import { ShowProjectPage } from "@/modules/projects/components/show-project-page";
import { ProjectNotFound } from "@/modules/projects/components/project-not-found";
import { projectsApi } from "@/modules/projects/api/projects.api";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface ShowProjectRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function ShowProjectRoutePage({
  params,
}: ShowProjectRoutePageProps) {
  const { id } = await params;

  try {
    const response = await projectsApi.getById(id);
    return <ShowProjectPage project={response.data.project} />;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      return <ProjectNotFound />;
    }

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Project Details</h1>
          <p className="text-sm text-muted-foreground">
            View project information and media.
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
