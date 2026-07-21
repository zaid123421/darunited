import { z } from "zod";

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  clientName: z.string().trim().min(1, "Client name is required"),
  clientRegion: z.string().trim().min(1, "Client region is required"),
  serviceId: z.coerce.number().positive("Service is required"),
  description: z.string().trim().min(1, "Description is required"),
  actualProjectDate: z.string().trim().min(1, "Date is required"),
  status: z.enum(["draft", "visible", "hidden"]),
});

export type ProjectFormValues = z.input<typeof projectFormSchema>;
export type ProjectFormSubmitValues = z.output<typeof projectFormSchema>;
