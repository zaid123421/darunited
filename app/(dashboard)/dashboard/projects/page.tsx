import { ProjectsListPage } from "@/modules/projects/components/projects-list-page";
import { projectsApi } from "@/modules/projects/api/projects.api";
import { hasActiveProjectFilters } from "@/modules/projects/lib/build-projects-list-path";
import { servicesApi } from "@/modules/services/api/services.api";
import { Card } from "@/shared/components/ui/card";

interface DashboardProjectsPageProps {
  searchParams: Promise<{
    page?: string;
    title?: string;
    description?: string;
    clientName?: string;
    serviceId?: string;
    actualProjectDate?: string;
    fromDate?: string;
    toDate?: string;
  }>;
}

async function loadServices() {
  try {
    const response = await servicesApi.list({ per_page: 100 });
    return response.data.services.map((service) => ({
      id: service.id,
      title: service.title,
    }));
  } catch {
    return [];
  }
}

export default async function DashboardProjectsPage({
  searchParams,
}: DashboardProjectsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const filters = {
    title: params.title,
    description: params.description,
    clientName: params.clientName,
    serviceId: params.serviceId,
    actualProjectDate: params.actualProjectDate,
    fromDate: params.fromDate,
    toDate: params.toDate,
  };

  const isSearchActive = hasActiveProjectFilters(filters);
  const services = await loadServices();

  try {
    const response = isSearchActive
      ? await projectsApi.search({
          page,
          title: filters.title,
          description: filters.description,
          clientName: filters.clientName,
          serviceId: filters.serviceId,
          actualProjectDate: filters.actualProjectDate,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        })
      : await projectsApi.list({ page });

    return (
      <ProjectsListPage
        data={response.data}
        services={services}
        filters={filters}
        isSearchActive={isSearchActive}
      />
    );
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, and manage portfolio projects.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load projects. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
