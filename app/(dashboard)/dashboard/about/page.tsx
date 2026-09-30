import { AboutSectionsListClient } from "@/modules/about/components/about-sections-list-client";
import { aboutApi } from "@/modules/about/api/about.api";
import { Card } from "@/shared/components/ui/card";

interface DashboardAboutPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DashboardAboutPage({
  searchParams,
}: DashboardAboutPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  try {
    const response = await aboutApi.list({ page, per_page: 12 });
    return <AboutSectionsListClient initialData={response.data} />;
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">About Us</h1>
          <p className="page-subtitle mt-1">
            Manage sections displayed on the about page.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load about us sections. Please try again later.
          </p>
        </Card>
      </div>
    );
  }
}
