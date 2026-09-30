import { z } from "zod";

export const productionFeatureFormSchema = z.object({
  id: z.number().optional(),
  title: z.string().trim().min(1, "Feature title is required"),
  script: z.string().trim().min(1, "Feature script is required"),
  isNew: z.boolean().optional(),
});

export const productionSectionFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  script: z.string().trim().min(1, "Script is required"),
  features: z.array(productionFeatureFormSchema),
});

export type ProductionFeatureFormValues = z.input<
  typeof productionFeatureFormSchema
>;
export type ProductionSectionFormValues = z.input<
  typeof productionSectionFormSchema
>;
export type ProductionSectionFormSubmitValues = z.output<
  typeof productionSectionFormSchema
>;
