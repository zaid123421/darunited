import { ApiError } from "@/shared/types/global-response";

export type ProductFormFieldErrors = {
  title?: string;
  description?: string;
  categoryId?: string;
  subCategoryIds?: string;
  media?: string;
  mainPic?: string;
  general?: string;
};

const TITLE_ERROR_PATTERNS = [
  /^The title field is required\.?$/i,
  /^A product with the same title already exists\.?$/i,
  /^The title has already been taken\.?$/i,
];

const DESCRIPTION_ERROR_PATTERNS = [/^The description field is required\.?$/i];

const SUBCATEGORY_ERROR_PATTERNS = [
  /^The sub category ids field is required\.?$/i,
  /^The sub category ids must /i,
  /^All selected subcategories must belong/i,
  /^The selected sub category ids/i,
];

const MEDIA_ERROR_PATTERNS = [
  /^The main pic field /i,
  /^The pic field /i,
  /^The images(\.\*)? field /i,
  /^The videos(\.\*)? field /i,
  /^The files(\.\*)? field /i,
  /^The new_files\./i,
];

const GALLERY_ERROR_PATTERNS = [
  /^Gallery orders must be unique\.?$/i,
  /^Each gallery item must /i,
  /^Duplicate gallery /i,
  /^No uploaded file was found /i,
  /^Invalid gallery /i,
  /^Invalid edited galleries /i,
  /^Existing product gallery items cannot be removed/i,
];

export function parseProductApiError(error: ApiError): ProductFormFieldErrors {
  const message = error.message.trim();

  if (TITLE_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { title: message };
  }

  if (DESCRIPTION_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { description: message };
  }

  if (SUBCATEGORY_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { subCategoryIds: message };
  }

  if (MEDIA_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    if (message.toLowerCase().includes("new_files")) {
      return { media: message };
    }

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
    return { general: message || "Product not found." };
  }

  if (error.statusCode === 422) {
    const lower = message.toLowerCase();

    if (
      lower.includes("title") ||
      lower.includes("same title") ||
      lower.includes("already been taken")
    ) {
      return { title: message };
    }

    if (lower.includes("description")) {
      return { description: message };
    }

    if (lower.includes("sub categor") || lower.includes("subcategor")) {
      return { subCategoryIds: message };
    }

    if (
      lower.includes("pic") ||
      lower.includes("image") ||
      lower.includes("video") ||
      lower.includes("gallery") ||
      lower.includes("new_files") ||
      lower.includes("file")
    ) {
      return { media: message };
    }
  }

  return { general: message };
}
