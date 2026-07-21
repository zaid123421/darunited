import { serverFetch } from "@/shared/lib/api/server";
import type { Settings } from "@/modules/settings/types";

export const settingsApi = {
  get: () => serverFetch<Settings>("/admin/settings"),

  update: (body: Settings) =>
    serverFetch<Settings>("/admin/settings", {
      method: "PUT",
      body,
    }),
};
