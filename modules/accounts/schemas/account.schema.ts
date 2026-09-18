import { z } from "zod";

export const createAccountSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(255, "Full name is too long."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255, "Email is too long."),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const updateAccountStatusSchema = z.object({
  userId: z.coerce
    .number()
    .int("User ID must be an integer.")
    .positive("User ID must be positive."),
  status: z.enum(["active", "inactive", "suspended"]),
});

export type UpdateAccountStatusFormValues = z.infer<
  typeof updateAccountStatusSchema
>;

export type UpdateAccountStatusFormInput = z.input<
  typeof updateAccountStatusSchema
>;

export const recoveryEmailSchema = z.object({
  recoveryEmail: z
    .string()
    .trim()
    .email("Enter a valid recovery email.")
    .max(255, "Email is too long."),
});

export type RecoveryEmailFormValues = z.infer<typeof recoveryEmailSchema>;
