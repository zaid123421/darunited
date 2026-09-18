import { ApiError } from "@/shared/types/global-response";

export type CategoryFormFieldErrors = {
  title?: string;
  media?: string;
  mainPic?: string;
  general?: string;
};

const TITLE_ERROR_PATTERNS = [
  /^The title field is required\.?$/i,
  /^A category with the same title already exists\.?$/i,
  /^The title has already been taken\.?$/i,
];

const MAIN_PIC_ERROR_PATTERNS = [
  /^The mainPic field /i,
  /^The main_pic field /i,
  /^The pic field /i,
];

export function parseCategoryApiError(error: ApiError): CategoryFormFieldErrors {
  const message = error.message.trim();

  if (TITLE_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { title: message };
  }

  if (MAIN_PIC_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { mainPic: message, media: message };
  }

  if (error.statusCode === 404) {
    return { general: message || "Category not found." };
  }

  if (error.statusCode === 422) {
    if (
      message.toLowerCase().includes("title") ||
      message.toLowerCase().includes("same title") ||
      message.toLowerCase().includes("already been taken")
    ) {
      return { title: message };
    }

    if (
      message.toLowerCase().includes("mainpic") ||
      message.toLowerCase().includes("main_pic") ||
      message.toLowerCase().includes("pic") ||
      message.toLowerCase().includes("image")
    ) {
      return { mainPic: message, media: message };
    }
  }

  return { general: message };
}
