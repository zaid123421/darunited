import { ApiError } from "@/shared/types/global-response";

export type ProductionFormFieldErrors = {
  title?: string;
  script?: string;
  features?: Record<number, { title?: string; script?: string }>;
  media?: string;
  general?: string;
};

const TITLE_ERROR_PATTERNS = [
  /^The title field is required\.?$/i,
  /^A production section with the same title already exists\.?$/i,
  /^The title has already been taken\.?$/i,
];

const SCRIPT_ERROR_PATTERNS = [/^The script field is required\.?$/i];

const FEATURE_TITLE_PATTERN = /^The features\.(\d+)\.title /i;
const FEATURE_SCRIPT_PATTERN = /^The features\.(\d+)\.script /i;

const MEDIA_ERROR_PATTERNS = [
  /^The images(\.\*)? field /i,
  /^The videos(\.\*)? field /i,
  /^The new_files\./i,
  /^Gallery orders must be unique\.?$/i,
  /^Each gallery item must /i,
  /^Duplicate gallery /i,
  /^No uploaded file was found /i,
  /^Invalid gallery /i,
  /^Invalid edited galleries /i,
];

export function parseProductionApiError(
  error: ApiError,
): ProductionFormFieldErrors {
  const message = error.message.trim();

  if (TITLE_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { title: message };
  }

  if (SCRIPT_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { script: message };
  }

  const featureTitleMatch = message.match(FEATURE_TITLE_PATTERN);
  if (featureTitleMatch) {
    return {
      features: { [Number(featureTitleMatch[1])]: { title: message } },
    };
  }

  const featureScriptMatch = message.match(FEATURE_SCRIPT_PATTERN);
  if (featureScriptMatch) {
    return {
      features: { [Number(featureScriptMatch[1])]: { script: message } },
    };
  }

  if (MEDIA_ERROR_PATTERNS.some((pattern) => pattern.test(message))) {
    return { media: message };
  }

  const lower = message.toLowerCase();

  if (lower.includes("feature")) {
    return { general: message };
  }

  if (
    lower.includes("image") ||
    lower.includes("video") ||
    lower.includes("media") ||
    lower.includes("gallery") ||
    lower.includes("file")
  ) {
    return { media: message };
  }

  return { general: message || "Something went wrong. Please try again." };
}
