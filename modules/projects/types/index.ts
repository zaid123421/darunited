import type { MediaItem } from "@/modules/media/types";

export type ProjectStatus = "draft" | "visible" | "hidden";

export type ProjectsViewMode = "grid" | "list" | "details";

export interface ProjectMedia {
  id: number;
  name?: string;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  role: "main" | "gallery" | string;
  order: number;
  created_at?: string;
}

export interface ProjectListItem {
  id: number;
  title: string;
  clientName: string;
  service: string;
  status: ProjectStatus;
  actualProjectDate: string;
  mainImageUrl: string | null;
}

export interface ProjectDetail {
  id: number;
  title: string;
  clientName: string;
  clientRegion: string;
  actualProjectDate: string;
  description: string;
  status: ProjectStatus;
  service: string;
  created_at?: string;
  updated_at?: string;
  media: ProjectMedia[];
  pagination?: ProjectPaginationMeta;
}

export interface ProjectShowData {
  project: ProjectDetail;
}

export interface ProjectPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface ProjectListData {
  projects: ProjectListItem[];
  pagination: ProjectPaginationMeta;
}

export interface ProjectListParams {
  page?: number;
  per_page?: number;
}

export interface ProjectSearchParams extends ProjectListParams {
  title?: string;
  description?: string;
  clientName?: string;
  serviceId?: number | string;
  actualProjectDate?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ProjectShowParams {
  per_page?: number;
  page?: number;
}

export type MainPicAction = "none" | "delete" | "upload";

export interface UpdateProjectInput {
  id: number;
  title: string;
  clientName: string;
  clientRegion: string;
  actualProjectDate: string;
  description: string;
  status: ProjectStatus;
  serviceId: number;
  initialTitle: string;
  initialClientName: string;
  initialClientRegion: string;
  initialActualProjectDate: string;
  initialDescription: string;
  initialStatus: ProjectStatus;
  initialServiceId: number;
  mainPicAction: MainPicAction;
  mainPicFile?: File;
  galleryItems: MediaItem[];
  galleryChanged: boolean;
}

export interface ServiceOption {
  id: number;
  title: string;
}
