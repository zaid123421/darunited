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

export function getMainPicFromProject(
  project: ProjectDetail,
): ProjectMedia | undefined {
  return project.media.find((item) => item.role === "main");
}

export function getGalleryFromProject(project: ProjectDetail): MediaItem[] {
  return project.media
    .filter((item) => item.role === "gallery")
    .sort((left, right) => left.order - right.order)
    .map(mapProjectMediaToGalleryItem);
}
