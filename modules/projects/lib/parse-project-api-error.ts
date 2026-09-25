import { ApiError } from "@/shared/types/global-response";

export type ProjectFormFieldErrors = {
  title?: string;
  description?: string;
  media?: string;
  mainPic?: string;
  general?: string;
};

const TITLE_ERROR_PATTERNS = [
  /^The title field is required\.?$/i,
  /^A project with the same title already exists\.?$/i,
];

const DESCRIPTION_ERROR_PATTERNS = [/^The description field is required\.?$/i];

const MEDIA_ERROR_PATTERNS = [
  /^The main pic field /i,
  /^The pic field /i,
  /^The images(\.\*)? field /i,
  /^The videos(\.\*)? field /i,
  /^The new_files\./i,
];

const GALLERY_ERROR_PATTERNS = [
  /^Gallery orders must be unique\.?$/i,
  /^Each gallery item must /i,
  /^Duplicate gallery /i,
  /^No uploaded file was found /i,
  /^Invalid gallery /i,
  /^Invalid edited galleries /i,
];

export function parseProjectApiError(error: ApiError): ProjectFormFieldErrors {
  const message = error.message.trim();

  if (TITLE_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { title: message };
  }

  if (DESCRIPTION_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { description: message };
  }

  if (MEDIA_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    if (
      message.toLowerCase().includes("main pic") ||
      message.toLowerCase().includes("pic field")
    ) {
      return { mainPic: message };
    }

    return { media: message };
  }

  if (GALLERY_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { media: message };
  }

  if (error.statusCode === 404) {
    return { general: message || "Project not found." };
  }

  if (error.statusCode === 422) {
    const lower = message.toLowerCase();

    if (lower.includes("title") || lower.includes("same title")) {
      return { title: message };
    }

    if (lower.includes("description")) {
      return { description: message };
    }

    if (
      lower.includes("pic") ||
      lower.includes("image") ||
      lower.includes("video") ||
      lower.includes("gallery") ||
      lower.includes("new_files")
    ) {
      return { media: message };
    }
  }

  return { general: message };
}
