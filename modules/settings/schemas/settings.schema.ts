import { z } from "zod";

export const settingsSchema = z.object({
  site_name: z.string().min(1, "Site name is required"),
  contact_email: z.string().email("Valid email is required"),
  enable_notifications: z.boolean(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
