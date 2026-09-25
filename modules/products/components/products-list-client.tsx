"use client";

import Link from "next/link";
import { useState } from "react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { ProductCard } from "@/modules/products/components/product-card";
import { ProductsSearchForm } from "@/modules/products/components/products-search-form";
import type { ProductSearchFilters } from "@/modules/products/components/products-search-form";
import { useDeleteProduct } from "@/modules/products/hooks/use-delete-product";
import { buildProductsListBasePath } from "@/modules/products/lib/build-products-list-path";
import type {
  CategoryOption,
  Product,
  ProductListData,
  SubCategoryOption,
} from "@/modules/products/types";
import { Card } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Pagination } from "@/shared/components/ui/pagination";

interface ProductsListClientProps {
  initialData: ProductListData;
  categories: CategoryOption[];
  subCategories: SubCategoryOption[];
  filters: ProductSearchFilters;
  isSearchActive: boolean;
}

export function ProductsListClient({
  initialData,
  categories,
  subCategories,
  filters,
  isSearchActive,
}: ProductsListClientProps) {
  const { products, pagination } = initialData;
  const { canWrite } = usePermissions();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const deleteProduct = useDeleteProduct({
    onSuccess: () => setProductToDelete(null),
    onError: () => setProductToDelete(null),
  });

  const handleDeleteConfirm = () => {
    if (!productToDelete) return;
    deleteProduct.mutate(productToDelete.id);
  };

  const paginationBasePath = `/dashboard/products${buildProductsListBasePath(filters as Record<string, string | undefined>)}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle mt-1">Manage product offerings and related media.</p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/products/add"
            className="btn-brand inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm sm:w-auto"
          >
            Add Product
          </Link>
        ) : null}
      </div>

      <ProductsSearchForm
        initialFilters={filters}
        categories={categories}
        subCategories={subCategories}
      />

      {products.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-base font-medium text-foreground">
            {isSearchActive ? "No products match your filters" : "No products yet"}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {isSearchActive
              ? "Try adjusting your search criteria or clear the filters."
              : "Create your first product to start building your offerings catalog."}
          </p>
          {!isSearchActive && canWrite ? (
            <Link
              href="/dashboard/products/add"
              className="btn-brand mt-2 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm"
            >
              Add Product
            </Link>
          ) : null}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={() => setProductToDelete(product)}
              />
            ))}
          </div>

          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            hasMore={pagination.has_more}
            basePath={paginationBasePath}
            itemLabel="products"
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Delete product?"
        description={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteProduct.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteProduct.isPending) {
            setProductToDelete(null);
          }
        }}
      />
    </div>
  );
}
