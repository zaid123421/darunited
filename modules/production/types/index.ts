import type { MediaItem } from "@/modules/media/types";

export interface ProductionMedia {
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

export interface ProductionFeature {
  id: number;
  title: string;
  script: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductionSection {
  id: number;
  title: string;
  script: string;
  features: ProductionFeature[];
  media: ProductionMedia[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductionSectionShowData {
  section: ProductionSection;
}

export interface ProductionPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface ProductionListData {
  sections: ProductionSection[];
  pagination: ProductionPaginationMeta;
}

export interface ProductionListParams {
  page?: number;
  per_page?: number;
}

export interface ProductionFeaturePayload {
  id?: number;
  title: string;
  script: string;
}

export interface UpdateProductionSectionInput {
  id: number;
  title: string;
  script: string;
  features: ProductionFeaturePayload[];
  initialTitle: string;
  initialScript: string;
  initialFeatures: ProductionFeaturePayload[];
  galleryItems: MediaItem[];
  galleryChanged: boolean;
}
