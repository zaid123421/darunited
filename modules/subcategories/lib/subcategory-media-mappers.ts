import type { MediaItem } from "@/modules/media/types";
import type { SubcategoryDetail, SubcategoryMedia } from "@/modules/subcategories/types";

export function isVideoMedia(media: SubcategoryMedia) {
  return media.mime_type.startsWith("video/");
}

export function mapSubcategoryMediaToGalleryItem(media: SubcategoryMedia): MediaItem {
  return {
    id: media.id,
    url: media.url,
    kind: isVideoMedia(media) ? "video" : "image",
  };
}

export function getMainPicFromSubcategory(subcategory: SubcategoryDetail): SubcategoryMedia | undefined {
  return subcategory.media.find((item) => item.role === "main");
}

export function getGalleryFromSubcategory(subcategory: SubcategoryDetail): MediaItem[] {
  return subcategory.media
    .filter((item) => item.role === "gallery")
    .sort((left, right) => left.order - right.order)
    .map(mapSubcategoryMediaToGalleryItem);
}
