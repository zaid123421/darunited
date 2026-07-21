import { ApiError } from "@/shared/types/global-response";

export type ContactFormFieldErrors = {
  email?: string;
  address?: string;
  phoneNumbers?: Record<number, { phoneNumber?: string; whatsappUrl?: string }>;
  general?: string;
};

const PHONE_FIELD_PATTERN = /^The phoneNumbers\.(\d+)\.phoneNumber /i;
const WHATSAPP_URL_FIELD_PATTERN = /^The phoneNumbers\.(\d+)\.whatsappUrl /i;

export function parseContactApiError(error: ApiError): ContactFormFieldErrors {
  const message = error.message.trim();

  if (error.statusCode === 422) {
    if (message.toLowerCase().includes("email")) {
      return { email: message };
    }

    if (message.toLowerCase().includes("address")) {
      return { address: message };
    }

    const phoneMatch = message.match(PHONE_FIELD_PATTERN);
    if (phoneMatch) {
      const index = Number(phoneMatch[1]);
      return {
        phoneNumbers: {
          [index]: { phoneNumber: message },
        },
      };
    }

    const whatsappUrlMatch = message.match(WHATSAPP_URL_FIELD_PATTERN);
    if (whatsappUrlMatch) {
      const index = Number(whatsappUrlMatch[1]);
      return {
        phoneNumbers: {
          [index]: { whatsappUrl: message },
        },
      };
    }

    if (message.toLowerCase().includes("phonenumbers")) {
      return { general: message };
    }
  }

  return { general: message || "Something went wrong. Please try again." };
}
