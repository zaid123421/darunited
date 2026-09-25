import type { MediaItem } from "@/modules/media/types";

export interface ProductCategoryRef {
  id: number;
  title: string;
  description?: string | null;
  pic?: string | null;
}

export interface ProductSubCategoryRef {
  id: number;
  title: string;
  description?: string | null;
  pic?: string | null;
}

export interface Product {
  id: number;
  title: string;
  description: string | null;
  pic?: string | null;
  category?: ProductCategoryRef | null;
  subCategories?: ProductSubCategoryRef[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductMedia {
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

export interface ProductDetail {
  id: number;
  title: string;
  description: string | null;
  category?: ProductCategoryRef | null;
  subCategories?: ProductSubCategoryRef[];
  media: ProductMedia[];
  created_at?: string;
  updated_at?: string;
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

export interface NestedProductsListData {
  products: Product[];
  pagination: ProductPaginationMeta;
}

export interface CategoryProductsData {
  category: ProductCategoryRef;
  products: Product[];
  pagination: ProductPaginationMeta;
}

export interface SubCategoryProductsData {
  subCategory: ProductSubCategoryRef & {
    category?: ProductCategoryRef;
  };
  products: Product[];
  pagination: ProductPaginationMeta;
}

export interface ProductListParams {
  page?: number;
  per_page?: number;
}

export interface ProductSearchParams extends ProductListParams {
  title?: string;
  description?: string;
  categoryIds?: Array<number | string> | string;
  subCategoryIds?: Array<number | string> | string;
}

export type MainPicAction = "none" | "delete" | "upload";

export interface UpdateProductInput {
  id: number;
  title: string;
  description: string;
  subCategoryIds: number[];
  initialTitle: string;
  initialDescription: string;
  initialSubCategoryIds: number[];
  mainPicAction: MainPicAction;
  mainPicFile?: File;
  galleryItems: MediaItem[];
  galleryChanged: boolean;
}

export interface CategoryOption {
  id: number;
  title: string;
}

export interface SubCategoryOption {
  id: number;
  title: string;
  categoryId: number;
}
