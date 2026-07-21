import { ApiError } from "@/shared/types/global-response";

export type ServiceFormFieldErrors = {
  title?: string;
  media?: string;
  mainPic?: string;
  general?: string;
};

const TITLE_ERROR_PATTERNS = [
  /^The title field is required\.?$/i,
  /^A service with the same title already exists\.?$/i,
  /^The title has already been taken\.?$/i,
];

const MEDIA_ERROR_PATTERNS = [
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
  /^Existing service gallery items cannot be removed/i,
];

export function parseServiceApiError(error: ApiError): ServiceFormFieldErrors {
  const message = error.message.trim();

  if (TITLE_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { title: message };
  }

  if (MEDIA_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    if (message.toLowerCase().includes("new_files")) {
      return { media: message };
    }

    return { mainPic: message.includes("pic") ? message : undefined, media: message };
  }

  if (GALLERY_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { media: message };
  }

  if (error.statusCode === 404) {
    return { general: message || "Service not found." };
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
      message.toLowerCase().includes("pic") ||
      message.toLowerCase().includes("image") ||
      message.toLowerCase().includes("video") ||
      message.toLowerCase().includes("gallery") ||
      message.toLowerCase().includes("new_files")
    ) {
      return { media: message };
    }
  }

  return { general: message };
}
