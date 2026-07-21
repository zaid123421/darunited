import { clientFetch } from "@/shared/lib/api/client";
import type { ContactInfoPayload } from "@/modules/contact/types";

export const contactClientApi = {
  create: (body: ContactInfoPayload) =>
    clientFetch<null>("/api/admin/contact-us", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (body: ContactInfoPayload) =>
    clientFetch<null>("/api/admin/contact-us", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
