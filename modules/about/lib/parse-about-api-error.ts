import { ApiError } from "@/shared/types/global-response";

export type AboutUsFormFieldErrors = {
  sections?: Record<number, { title?: string; script?: string }>;
  general?: string;
};

const SECTION_TITLE_PATTERN = /^The sections\.(\d+)\.title /i;
const SECTION_SCRIPT_PATTERN = /^The sections\.(\d+)\.script /i;

export function parseAboutApiError(error: ApiError): AboutUsFormFieldErrors {
  const message = error.message.trim();

  if (error.statusCode === 422) {
    const titleMatch = message.match(SECTION_TITLE_PATTERN);
    if (titleMatch) {
      const index = Number(titleMatch[1]);
      return { sections: { [index]: { title: message } } };
    }

    const scriptMatch = message.match(SECTION_SCRIPT_PATTERN);
    if (scriptMatch) {
      const index = Number(scriptMatch[1]);
      return { sections: { [index]: { script: message } } };
    }

    if (message.toLowerCase().includes("sections")) {
      return { general: message };
    }
  }

  if (error.statusCode === 500 && message.toLowerCase().includes("duplicate entry")) {
    return { general: message };
  }

  return { general: message || "Something went wrong. Please try again." };
}
