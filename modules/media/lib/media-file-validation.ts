export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

export const ALLOWED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime"]);

export const ALLOWED_VIDEO_EXTENSIONS = new Set([".mp4", ".mov"]);

export const ALLOWED_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export const SERVICE_MEDIA_ACCEPT = `${ALLOWED_IMAGE_ACCEPT},video/mp4,video/quicktime,.mp4,.mov`;

export const ALLOWED_IMAGE_TYPES_LABEL = "JPG, JPEG, PNG, WEBP";

export const INVALID_IMAGE_TYPE_MESSAGE =
  "Only JPG, JPEG, PNG, and WEBP images are allowed.";

function getFileExtension(filename: string) {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
}

export function isAllowedImageFile(file: File) {
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return true;
  }

  return ALLOWED_IMAGE_EXTENSIONS.has(getFileExtension(file.name));
}

export function isAllowedVideoFile(file: File) {
  if (ALLOWED_VIDEO_MIME_TYPES.has(file.type)) {
    return true;
  }

  return ALLOWED_VIDEO_EXTENSIONS.has(getFileExtension(file.name));
}

export function classifyMediaFile(file: File): "image" | "video" | null {
  if (isAllowedVideoFile(file)) {
    return "video";
  }

  if (isAllowedImageFile(file)) {
    return "image";
  }

  return null;
}
