import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
