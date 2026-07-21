import { ShowProjectPage } from "@/modules/projects/components/show-project-page";
import { ProjectNotFound } from "@/modules/projects/components/project-not-found";
import { projectsApi } from "@/modules/projects/api/projects.api";
import { buildProjectShowBasePath } from "@/modules/projects/lib/build-projects-list-path";
import { getMainPicFromProject } from "@/modules/projects/lib/project-media-mappers";
import type { ProjectMedia } from "@/modules/projects/types";
import { Card } from "@/shared/components/ui/card";
import { ApiError } from "@/shared/types/global-response";

interface ShowProjectRoutePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ShowProjectRoutePage({
  params,
  searchParams,
}: ShowProjectRoutePageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const mediaPage = Math.max(1, Number(pageParam) || 1);

  try {
    const response = await projectsApi.getById(id, { page: mediaPage, per_page: 10 });
    const project = response.data.project;

    let mainPic: ProjectMedia | undefined = getMainPicFromProject(project);

    if (!mainPic && mediaPage !== 1) {
      const firstPageResponse = await projectsApi.getById(id, { page: 1, per_page: 10 });
      mainPic = getMainPicFromProject(firstPageResponse.data.project);
    }

    const mediaBasePath = buildProjectShowBasePath(id);

    return (
      <ShowProjectPage
        project={project}
        mainPic={mainPic}
        mediaBasePath={mediaBasePath}
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
            Project Details
          </h1>
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
