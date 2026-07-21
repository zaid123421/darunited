import type { MediaItem } from "@/modules/media/types";
import type { ProductDetail, ProductMedia } from "@/modules/products/types";

export function isVideoMedia(media: ProductMedia) {
  return media.mime_type.startsWith("video/");
}

export function mapProductMediaToGalleryItem(media: ProductMedia): MediaItem {
  return {
    id: media.id,
    url: media.url,
    kind: isVideoMedia(media) ? "video" : "image",
  };
}

export function getMainPicFromProduct(product: ProductDetail): ProductMedia | undefined {
  return product.media.find((item) => item.role === "main");
}

export function getGalleryFromProduct(product: ProductDetail): MediaItem[] {
  return product.media
    .filter((item) => item.role === "gallery")
    .sort((left, right) => left.order - right.order)
    .map(mapProductMediaToGalleryItem);
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
