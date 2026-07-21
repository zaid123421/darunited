import { ApiError } from "@/shared/types/global-response";

export type ProjectFormFieldErrors = {
  title?: string;
  clientName?: string;
  clientRegion?: string;
  serviceId?: string;
  description?: string;
  actualProjectDate?: string;
  status?: string;
  media?: string;
  mainPic?: string;
  general?: string;
};

const TITLE_ERROR_PATTERNS = [
  /^The title field is required\.?$/i,
  /^A project with the same title already exists\.?$/i,
];

const CLIENT_NAME_ERROR_PATTERNS = [/^The client name field is required\.?$/i];

const CLIENT_REGION_ERROR_PATTERNS = [
  /^The client region field is required\.?$/i,
];

const DESCRIPTION_ERROR_PATTERNS = [/^The description field is required\.?$/i];

const DATE_ERROR_PATTERNS = [
  /^The actual project date field is required\.?$/i,
];

const STATUS_ERROR_PATTERNS = [/^The status field is required\.?$/i];

const SERVICE_ERROR_PATTERNS = [/^The selected service id is invalid\.?$/i];

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

  if (CLIENT_NAME_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { clientName: message };
  }

  if (CLIENT_REGION_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { clientRegion: message };
  }

  if (DESCRIPTION_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { description: message };
  }

  if (DATE_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { actualProjectDate: message };
  }

  if (STATUS_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { status: message };
  }

  if (SERVICE_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { serviceId: message };
  }

  if (MEDIA_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    if (message.toLowerCase().includes("main pic") || message.toLowerCase().includes("pic field")) {
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

    if (lower.includes("client name")) {
      return { clientName: message };
    }

    if (lower.includes("client region")) {
      return { clientRegion: message };
    }

    if (lower.includes("description")) {
      return { description: message };
    }

    if (lower.includes("actual project date") || lower.includes("date")) {
      return { actualProjectDate: message };
    }

    if (lower.includes("status")) {
      return { status: message };
    }

    if (lower.includes("service")) {
      return { serviceId: message };
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
