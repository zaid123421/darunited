import { ProjectsListClient } from "@/modules/projects/components/projects-list-client";
import type { ProjectSearchFilters } from "@/modules/projects/components/projects-search-form";
import type { ProjectListData } from "@/modules/projects/types";

interface ProjectsListPageProps {
  data: ProjectListData;
  filters: ProjectSearchFilters;
  isSearchActive: boolean;
}

export function ProjectsListPage({
  data,
  filters,
  isSearchActive,
}: ProjectsListPageProps) {
  return (
    <ProjectsListClient
      initialData={data}
      filters={filters}
      isSearchActive={isSearchActive}
    />
  );
}
