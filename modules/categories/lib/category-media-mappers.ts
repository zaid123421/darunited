import type { MediaItem } from "@/modules/media/types";
import type { CategoryDetail, CategoryMedia } from "@/modules/categories/types";

export function isVideoMedia(media: CategoryMedia) {
  return media.mime_type.startsWith("video/");
}

export function mapCategoryMediaToGalleryItem(media: CategoryMedia): MediaItem {
  return {
    id: media.id,
    url: media.url,
    kind: isVideoMedia(media) ? "video" : "image",
  };
}

export function getMainPicFromCategory(category: CategoryDetail): CategoryMedia | undefined {
  return category.media.find((item) => item.role === "main");
}

export function getGalleryFromCategory(category: CategoryDetail): MediaItem[] {
  return category.media
    .filter((item) => item.role === "gallery")
    .sort((left, right) => left.order - right.order)
    .map(mapCategoryMediaToGalleryItem);
}
