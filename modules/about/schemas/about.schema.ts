import { z } from "zod";

export const aboutUsSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  script: z.string().min(1, "Script is required"),
});

export const aboutUsFormSectionSchema = aboutUsSectionSchema.extend({
  id: z.number().optional(),
  isNew: z.boolean().optional(),
});

export const aboutUsFormSchema = z.object({
  sections: z.array(aboutUsFormSectionSchema),
});

export const aboutUsSyncSectionSchema = aboutUsSectionSchema.extend({
  id: z.number().optional(),
});

export const aboutUsSyncSchema = z.object({
  sections: z.array(aboutUsSyncSectionSchema).min(1, "At least one section is required"),
});

export type AboutUsSectionValues = z.infer<typeof aboutUsSectionSchema>;
export type AboutUsFormSectionValues = z.infer<typeof aboutUsFormSectionSchema>;
export type AboutUsFormValues = z.infer<typeof aboutUsFormSchema>;
export type AboutUsSyncValues = z.infer<typeof aboutUsSyncSchema>;
