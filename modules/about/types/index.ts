import type { MediaItem } from "@/modules/media/types";

export interface AboutUsMedia {
  id: number;
  name?: string;
  file_name: string;
  type?: "image" | "video" | "file" | string;
  mime_type: string;
  size: number;
  url: string;
  role: "main" | "gallery" | string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface AboutUsSection {
  id: number;
  title: string;
  script: string;
  media: AboutUsMedia[];
  created_at?: string;
  updated_at?: string;
}

export interface AboutUsSectionShowData {
  section: AboutUsSection;
}

export interface AboutUsPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface AboutUsListData {
  sections: AboutUsSection[];
  pagination: AboutUsPaginationMeta;
}

export interface AboutUsListParams {
  page?: number;
  per_page?: number;
}

export interface UpdateAboutUsSectionInput {
  id: number;
  title: string;
  script: string;
  initialTitle: string;
  initialScript: string;
  galleryItems: MediaItem[];
  galleryChanged: boolean;
}
