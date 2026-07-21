import { z } from "zod";

export const contactPhoneNumberSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  hasWhatsapp: z.boolean(),
});

export const contactInfoSchema = z.object({
  email: z.string().min(1, "Email is required").email("Valid email is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumbers: z
    .array(contactPhoneNumberSchema)
    .min(1, "At least one phone number is required"),
});

export const contactMessageSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  title: z.string().min(1, "Title is required"),
  script: z.string().min(1, "Message is required"),
  service: z.string().min(1, "Service is required"),
});

export type ContactInfoValues = z.infer<typeof contactInfoSchema>;
export type ContactMessageValues = z.infer<typeof contactMessageSchema>;
