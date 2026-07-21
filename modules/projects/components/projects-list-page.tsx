import { ProjectsListClient } from "@/modules/projects/components/projects-list-client";
import type { ProjectListData, ServiceOption } from "@/modules/projects/types";

interface ProjectsListPageProps {
  data: ProjectListData;
  services: ServiceOption[];
  filters: {
    title?: string;
    description?: string;
    clientName?: string;
    serviceId?: string;
    actualProjectDate?: string;
    fromDate?: string;
    toDate?: string;
  };
  isSearchActive: boolean;
}

export function ProjectsListPage({
  data,
  services,
  filters,
  isSearchActive,
}: ProjectsListPageProps) {
  return (
    <ProjectsListClient
      initialData={data}
      services={services}
      filters={filters}
      isSearchActive={isSearchActive}
    />
  );
}
