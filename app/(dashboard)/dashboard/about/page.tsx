import { AboutUsPage } from "@/modules/about/components/about-us-page";
import { aboutApi } from "@/modules/about/api/about.api";
import { Card } from "@/shared/components/ui/card";

export default async function DashboardAboutPage() {
  try {
    const response = await aboutApi.get();
    return <AboutUsPage sections={response.data ?? []} />;
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">About Us</h1>
          <p className="text-sm text-muted-foreground">
            Edit sections displayed on the about page.
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
