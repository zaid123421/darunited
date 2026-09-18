import type { Category } from "@/modules/categories/types";

export function getCategoryPicUrl(category: Category): string | null {
  return category.pic?.trim() || null;
}
