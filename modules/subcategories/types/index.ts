import type { MediaItem } from "@/modules/media/types";

export interface Subcategory {
  id: number;
  title: string;
  description: string | null;
  categoryId: number;
  categoryTitle?: string | null;
  pic?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryOption {
  id: number;
  title: string;
}

export interface SubcategoryMedia {
  id: number;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  role: "main" | "gallery" | string;
  order: number;
  created_at?: string;
}

export interface SubcategoryDetail extends Subcategory {
  media: SubcategoryMedia[];
  pagination?: SubcategoryPaginationMeta;
}

export interface SubcategoryShowData {
  subcategory: SubcategoryDetail;
}

export interface SubcategoryPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface SubcategoryListData {
  subcategories: Subcategory[];
  pagination: SubcategoryPaginationMeta;
}

export interface SubcategoryListParams {
  search?: string;
  page?: number;
  per_page?: number;
  categoryId?: number | string;
}

export interface SubcategoryShowParams {
  per_page?: number;
  page?: number;
}

export type MainPicAction = "none" | "delete" | "upload";

export interface UpdateSubcategoryInput {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  initialTitle: string;
  initialDescription?: string;
  initialCategoryId: number;
  mainPicAction: MainPicAction;
  mainPicFile?: File;
  galleryItems: MediaItem[];
  galleryChanged: boolean;
}
