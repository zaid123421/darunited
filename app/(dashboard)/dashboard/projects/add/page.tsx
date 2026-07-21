import { AddProjectPage } from "@/modules/projects/components/add-project-page";
import { servicesApi } from "@/modules/services/api/services.api";
import { Card } from "@/shared/components/ui/card";

async function loadServices() {
  const response = await servicesApi.list({ per_page: 100 });
  return response.data.services.map((service) => ({
    id: service.id,
    title: service.title,
  }));
}

export default async function AddProjectRoutePage() {
  try {
    const services = await loadServices();
    return <AddProjectPage services={services} />;
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">Add Project</h1>
          <p className="text-sm text-muted-foreground">
            Create a new portfolio project with media upload.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load services. Please refresh the page or try again later.
          </p>
        </Card>
      </div>
    );
  }
}
