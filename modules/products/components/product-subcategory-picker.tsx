"use client";

import type { SubCategoryOption } from "@/modules/products/types";
import { cn } from "@/shared/lib/cn";

interface ProductSubcategoryPickerProps {
  subCategories: SubCategoryOption[];
  selectedCategoryId: number;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  error?: string;
}

export function ProductSubcategoryPicker({
  subCategories,
  selectedCategoryId,
  selectedIds,
  onChange,
  error,
}: ProductSubcategoryPickerProps) {
  const filtered =
    selectedCategoryId > 0
      ? subCategories.filter((sc) => sc.categoryId === selectedCategoryId)
      : [];

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((existing) => existing !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (selectedCategoryId <= 0) {
    return (
      <p className="text-xs italic text-muted-foreground">
        Select a category first to choose subcategories.
      </p>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="text-xs italic text-muted-foreground">
        No subcategories available for this category.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {filtered.map((sc) => {
          const checked = selectedIds.includes(sc.id);
          return (
            <label
              key={sc.id}
              className={cn(
                "inline-flex cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                checked
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-input text-foreground hover:border-primary/40",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(sc.id)}
                className="sr-only"
              />
              {sc.title}
            </label>
          );
        })}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
