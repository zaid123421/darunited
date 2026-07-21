import { ServicesListClient } from "@/modules/services/components/services-list-client";
import type { ServiceListData } from "@/modules/services/types";

interface ServicesListPageProps {
  data: ServiceListData;
}

export function ServicesListPage({ data }: ServicesListPageProps) {
  return <ServicesListClient initialData={data} />;
}
