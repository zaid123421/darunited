"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import type { CategoryOption, SubCategoryOption } from "@/modules/products/types";
import { buildProductsListQuery } from "@/modules/products/lib/build-products-list-path";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/cn";

export interface ProductSearchFilters {
  title?: string;
  description?: string;
  categoryIds?: string;
  subCategoryIds?: string;
}

interface ProductsSearchFormProps {
  initialFilters: ProductSearchFilters;
  categories: CategoryOption[];
  subCategories: SubCategoryOption[];
}

export function ProductsSearchForm({
  initialFilters,
  categories,
  subCategories,
}: ProductsSearchFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    initialFilters.categoryIds ? Number(initialFilters.categoryIds) : 0,
  );

  const categoryOptions = categories.map((cat) => ({
    label: cat.title,
    value: String(cat.id),
  }));

  const filteredSubCategories =
    selectedCategoryId > 0
      ? subCategories.filter((sc) => sc.categoryId === selectedCategoryId)
      : subCategories;

  const subCategoryOptions = filteredSubCategories.map((sc) => ({
    label: sc.title,
    value: String(sc.id),
  }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params: Record<string, string | undefined> = {};

    ["title", "description", "categoryIds", "subCategoryIds"].forEach((key) => {
      const value = String(formData.get(key) ?? "").trim();
      if (value) {
        params[key] = value;
      }
    });

    router.push(`/dashboard/products${buildProductsListQuery(params, 1)}`);
  };

  const handleClear = () => {
    setSelectedCategoryId(0);
    router.push("/dashboard/products");
  };

  return (
    <Card className="p-4 sm:p-6">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
      >
        <CardTitle className="text-sm font-semibold sm:text-base">Search Products</CardTitle>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4 sm:pt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="title"
                label="Title"
                placeholder="Search by title"
                defaultValue={initialFilters.title ?? ""}
              />
              <Input
                name="description"
                label="Description"
                placeholder="Search by description"
                defaultValue={initialFilters.description ?? ""}
              />
              <Select
                name="categoryIds"
                label="Category"
                placeholder="All categories"
                options={categoryOptions}
                defaultValue={initialFilters.categoryIds ?? ""}
                onValueChange={(value) => setSelectedCategoryId(Number(value) || 0)}
              />
              <Select
                name="subCategoryIds"
                label="Subcategory"
                placeholder={
                  selectedCategoryId > 0 ? "All subcategories" : "Select category first"
                }
                options={subCategoryOptions}
                defaultValue={initialFilters.subCategoryIds ?? ""}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="submit" className="h-10 gap-2 px-4">
                <Search className="h-4 w-4" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 px-4"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}
