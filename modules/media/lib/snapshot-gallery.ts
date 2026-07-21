import type { MediaItem } from "@/modules/media/types";

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