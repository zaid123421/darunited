import type { MediaItem } from "@/modules/media/types";

export interface Category {
  id: number;
  title: string;
  description: string | null;
  pic?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryMedia {
  id: number;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  role: "main" | "gallery" | string;
  order: number;
  created_at?: string;
}

export interface CategoryDetail extends Category {
  media: CategoryMedia[];
  pagination?: CategoryPaginationMeta;
}

export interface CategoryShowData {
  category: CategoryDetail;
}

export interface CategoryPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface CategoryListData {
  categories: Category[];
  pagination: CategoryPaginationMeta;
}

export interface CategoryListParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CategoryShowParams {
  per_page?: number;
  page?: number;
}

export type MainPicAction = "none" | "delete" | "upload";

export interface UpdateCategoryInput {
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
