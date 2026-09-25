import { z } from "zod";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

export const projectFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .refine((value) => stripHtml(value).length > 0, {
      message: "Description is required",
    }),
});

export type ProjectFormValues = z.input<typeof projectFormSchema>;
export type ProjectFormSubmitValues = z.output<typeof projectFormSchema>;
