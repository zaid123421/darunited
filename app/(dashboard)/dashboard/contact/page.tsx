import { ContactInfoPage } from "@/modules/contact/components/contact-info-page";
import { contactApi } from "@/modules/contact/api/contact.api";
import { hasContactInfo } from "@/modules/contact/lib/map-contact-info-to-form";
import { Card } from "@/shared/components/ui/card";

export default async function DashboardContactPage() {
  try {
    const response = await contactApi.getInfo();
    const contactInfo = response.data;
    const mode = hasContactInfo(contactInfo) ? "update" : "create";

    return <ContactInfoPage contactInfo={contactInfo} mode={mode} />;
  } catch {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="page-title">
            Contact Info
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage contact details shown on the landing page.
          </p>
        </div>
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">
            Unable to load contact info. Please try again later.
          </p>
        </Card>
      </div>
    );
  }
}
