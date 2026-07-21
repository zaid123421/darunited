import type { MediaItem } from "@/modules/media/types";
import type { ProjectDetail, ProjectMedia } from "@/modules/projects/types";

export function isVideoMedia(media: ProjectMedia) {
  return media.mime_type.startsWith("video/");
}

export function mapProjectMediaToGalleryItem(media: ProjectMedia): MediaItem {
  return {
    id: media.id,
    url: media.url,
    kind: isVideoMedia(media) ? "video" : "image",
  };
}

export function getMainPicFromProject(project: ProjectDetail): ProjectMedia | undefined {
  return project.media.find((item) => item.role === "main");
}

export function getGalleryFromProject(project: ProjectDetail): MediaItem[] {
  return project.media
    .filter((item) => item.role === "gallery")
    .sort((left, right) => left.order - right.order)
    .map(mapProjectMediaToGalleryItem);
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

export function formatProjectDisplayDate(date: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return `${month}/${day}/${year}`;
  }

  return date;
}

export function findServiceIdByTitle(
  services: Array<{ id: number; title: string }>,
  serviceTitle: string,
) {
  return services.find((service) => service.title === serviceTitle)?.id ?? 0;
}
