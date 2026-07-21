import type { MediaItem } from "@/modules/media/types";
import type { ServiceDetail, ServiceMedia } from "@/modules/services/types";

export function isVideoMedia(media: ServiceMedia) {
  return media.mime_type.startsWith("video/");
}

export function mapServiceMediaToGalleryItem(media: ServiceMedia): MediaItem {
  return {
    id: media.id,
    url: media.url,
    kind: isVideoMedia(media) ? "video" : "image",
  };
}

export function getMainPicFromService(service: ServiceDetail): ServiceMedia | undefined {
  return service.media.find((item) => item.role === "main");
}

export function getGalleryFromService(service: ServiceDetail): MediaItem[] {
  return service.media
    .filter((item) => item.role === "gallery")
    .sort((left, right) => left.order - right.order)
    .map(mapServiceMediaToGalleryItem);
}

export function snapshotGallery(items: MediaItem[]) {
  return JSON.stringify(
    items.map((item, index) => ({
      id: item.id ?? null,
      tempKey: item.tempKey ?? null,
      order: index + 1,
      isNew: Boolean(item.file),
    })),
  );
}
