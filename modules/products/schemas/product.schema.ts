import { z } from "zod";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

export const productFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .refine((value) => stripHtml(value).length > 0, {
      message: "Description is required",
    }),
  categoryId: z.coerce.number().positive("Category is required"),
  subCategoryIds: z
    .array(z.coerce.number().positive())
    .min(1, "Select at least one subcategory"),
});

export type ProductFormValues = z.input<typeof productFormSchema>;
export type ProductFormSubmitValues = z.output<typeof productFormSchema>;
