import { z } from "zod";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

export const productFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return value;
      }

      return stripHtml(value).length === 0 ? undefined : value;
    }),
});

export type ProductFormValues = z.input<typeof productFormSchema>;
export type ProductFormSubmitValues = z.output<typeof productFormSchema>;
