import type { MediaItem } from "@/modules/media/types";

export interface Product {
  id: number;
  title: string;
  description: string | null;
  pic?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductMedia {
  id: number;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
  role: "main" | "gallery" | string;
  order: number;
  created_at?: string;
}

export interface ProductDetail extends Product {
  media: ProductMedia[];
  pagination?: ProductPaginationMeta;
}

export interface ProductShowData {
  product: ProductDetail;
}

export interface ProductPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface ProductListData {
  products: Product[];
  pagination: ProductPaginationMeta;
}

export interface ProductListParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ProductShowParams {
  per_page?: number;
  page?: number;
}

export type MainPicAction = "none" | "delete" | "upload";

export interface UpdateProductInput {
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
