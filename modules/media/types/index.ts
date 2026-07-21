export type MediaKind = "image" | "video";

export interface MediaItem {
  url: string;
  kind: MediaKind;
  file?: File;
  isMain?: boolean;
  id?: number;
  tempKey?: string;
}
