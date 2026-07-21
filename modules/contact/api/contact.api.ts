import { serverFetch } from "@/shared/lib/api/server";
import type { ContactInfo, ContactMessagePayload } from "@/modules/contact/types";

export const contactApi = {
  getInfo: () => serverFetch<ContactInfo | null>("/admin/contact-us"),

  sendPublicMessage: (body: ContactMessagePayload) =>
    serverFetch<null>("/public/contact/send-message", {
      method: "POST",
      body,
      auth: false,
    }),
};
