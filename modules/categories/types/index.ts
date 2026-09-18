import type { MediaItem } from "@/modules/media/types";

export interface Category {
  id: number;
  title: string;
  description?: string | null;
  pic?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryDetail extends Category {}

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

export type MainPicAction = "none" | "upload";

export interface UpdateCategoryInput {
  id: number;
  title: string;
  description?: string;
  initialTitle: string;
  initialDescription?: string;
  mainPicAction: MainPicAction;
  mainPicFile?: File;
  /** @deprecated Categories no longer support gallery media on the backend. */
  galleryItems?: MediaItem[];
  galleryChanged?: boolean;
}
