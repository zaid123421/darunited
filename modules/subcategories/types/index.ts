export interface SubcategoryCategoryRef {
  id: number;
  title: string;
  pic?: string | null;
}

export interface Subcategory {
  id: number;
  title: string;
  description: string | null;
  pic?: string | null;
  category?: SubcategoryCategoryRef;
}

export interface CategoryOption {
  id: number;
  title: string;
}

export interface SubcategoryDetail extends Subcategory {
  category: SubcategoryCategoryRef;
}

export interface SubcategoryShowData {
  subCategory: SubcategoryDetail;
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
  subCategories: Subcategory[];
  pagination: SubcategoryPaginationMeta;
}

export interface CategorySubcategoriesData {
  category: SubcategoryCategoryRef;
  subCategories: Subcategory[];
  pagination: SubcategoryPaginationMeta;
}

export interface SubcategoryListParams {
  page?: number;
  per_page?: number;
}

export type MainPicAction = "none" | "upload";

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
}
