import type { Subcategory } from "@/modules/subcategories/types";

export function getSubcategoryPicUrl(subcategory: Subcategory): string | null {
  return subcategory.pic?.trim() || null;
}

export function getSubcategoryCategoryId(
  subcategory: Subcategory,
): number | undefined {
  return subcategory.category?.id;
}

export function getSubcategoryCategoryTitle(
  subcategory: Subcategory,
): string | undefined {
  return subcategory.category?.title?.trim() || undefined;
}
