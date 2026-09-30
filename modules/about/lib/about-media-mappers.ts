import type { MediaItem } from "@/modules/media/types";
import type { AboutUsMedia, AboutUsSection } from "@/modules/about/types";

export function isVideoMedia(media: AboutUsMedia) {
  return media.mime_type.startsWith("video/") || media.type === "video";
}

export function mapAboutMediaToGalleryItem(media: AboutUsMedia): MediaItem {
  return {
    id: media.id,
    url: media.url,
    kind: isVideoMedia(media) ? "video" : "image",
  };
}

export function getGalleryFromAboutSection(section: AboutUsSection): MediaItem[] {
  return [...section.media]
    .sort((left, right) => left.order - right.order)
    .map(mapAboutMediaToGalleryItem);
}

export function getAboutSectionThumbnail(section: AboutUsSection): string | null {
  const image = [...section.media]
    .sort((left, right) => left.order - right.order)
    .find((item) => !isVideoMedia(item));

  return image?.url ?? null;
}
