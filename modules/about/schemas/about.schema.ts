import { z } from "zod";

export const aboutUsSectionFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  script: z.string().trim().min(1, "Script is required"),
});

export type AboutUsSectionFormValues = z.input<typeof aboutUsSectionFormSchema>;
export type AboutUsSectionFormSubmitValues = z.output<
  typeof aboutUsSectionFormSchema
>;
