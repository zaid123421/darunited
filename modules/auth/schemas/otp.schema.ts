import { z } from "zod";

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
