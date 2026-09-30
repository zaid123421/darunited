import type { MediaItem } from "@/modules/media/types";
import type {
  ProductionFeature,
  ProductionFeaturePayload,
  ProductionMedia,
  ProductionSection,
} from "@/modules/production/types";

export function isVideoMedia(media: ProductionMedia) {
  return media.mime_type.startsWith("video/") || media.type === "video";
}

export function mapProductionMediaToGalleryItem(
  media: ProductionMedia,
): MediaItem {
  return {
    id: media.id,
    url: media.url,
    kind: isVideoMedia(media) ? "video" : "image",
  };
}

export function getGalleryFromProductionSection(
  section: ProductionSection,
): MediaItem[] {
  return [...section.media]
    .sort((left, right) => left.order - right.order)
    .map(mapProductionMediaToGalleryItem);
}

export function getProductionSectionThumbnail(
  section: ProductionSection,
): string | null {
  const image = [...section.media]
    .sort((left, right) => left.order - right.order)
    .find((item) => !isVideoMedia(item));

  return image?.url ?? null;
}

export function mapFeaturesToPayload(
  features: ProductionFeature[],
): ProductionFeaturePayload[] {
  return features.map((feature) => ({
    id: feature.id,
    title: feature.title,
    script: feature.script,
  }));
}
