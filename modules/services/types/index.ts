import type { MediaItem } from "@/modules/media/types";

export interface Service {
  id: number;
  title: string;
  description: string | null;
  pic?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceMedia {
  id: number;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  role: "main" | "gallery" | string;
  order: number;
  created_at?: string;
}

export interface ServiceDetail extends Service {
  media: ServiceMedia[];
  pagination?: ServicePaginationMeta;
}

export interface ServiceShowData {
  service: ServiceDetail;
}

export interface ServicePaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface ServiceListData {
  services: Service[];
  pagination: ServicePaginationMeta;
}

export interface ServiceListParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ServiceShowParams {
  per_page?: number;
  page?: number;
}

export interface ServiceProject {
  id: number;
  title: string;
  mainPic: string | null;
  actualProjectDate: string;
}

export interface ServiceProjectsListData {
  projects: ServiceProject[];
  pagination: ServicePaginationMeta;
}

export interface ServiceProjectsListParams {
  page?: number;
  per_page?: number;
}

export type MainPicAction = "none" | "delete" | "upload";

export interface UpdateServiceInput {
  id: number;
  title: string;
  description?: string;
  initialTitle: string;
  initialDescription?: string;
  mainPicAction: MainPicAction;
  mainPicFile?: File;
  galleryItems: MediaItem[];
  galleryChanged: boolean;
}
