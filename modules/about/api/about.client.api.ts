import { clientFetch } from "@/shared/lib/api/client";
import type { AboutUsSyncPayload } from "@/modules/about/types";

export const aboutClientApi = {
  sync: (body: AboutUsSyncPayload) =>
    clientFetch<null>("/api/admin/about-us", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
