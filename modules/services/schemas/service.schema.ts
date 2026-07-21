import { z } from "zod";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

export const serviceFormSchema = z.object({
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

export type ServiceFormValues = z.input<typeof serviceFormSchema>;
export type ServiceFormSubmitValues = z.output<typeof serviceFormSchema>;
