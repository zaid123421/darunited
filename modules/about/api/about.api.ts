import { serverFetch } from "@/shared/lib/api/server";
import type { AboutUsSection } from "@/modules/about/types";

export const aboutApi = {
  get: () => serverFetch<AboutUsSection[]>("/admin/about-us"),
};
