import { z } from "zod";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

export const subcategoryFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  categoryId: z.coerce.number().positive("Category is required"),
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

export type SubcategoryFormValues = z.input<typeof subcategoryFormSchema>;
export type SubcategoryFormSubmitValues = z.output<typeof subcategoryFormSchema>;
