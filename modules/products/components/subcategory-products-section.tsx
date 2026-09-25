"use client";

import Link from "next/link";
import { useState } from "react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { ProductCard } from "@/modules/products/components/product-card";
import { useDeleteProduct } from "@/modules/products/hooks/use-delete-product";
import type { Product, NestedProductsListData } from "@/modules/products/types";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Pagination } from "@/shared/components/ui/pagination";

interface SubcategoryProductsSectionProps {
  subcategoryId: number;
  data: NestedProductsListData;
  loadError?: boolean;
}

export function SubcategoryProductsSection({
  subcategoryId,
  data,
  loadError = false,
}: SubcategoryProductsSectionProps) {
  const { products, pagination } = data;
  const { canWrite } = usePermissions();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // page param used for products pagination on subcategory page
  const paginationBasePath = `/dashboard/subcategories/${subcategoryId}`;

  const deleteProduct = useDeleteProduct({
    onSuccess: () => setProductToDelete(null),
    onError: () => setProductToDelete(null),
  });

  const handleDeleteConfirm = () => {
    if (!productToDelete) return;
    deleteProduct.mutate(productToDelete.id);
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-semibold sm:text-base">Products</CardTitle>
        {canWrite ? (
          <Link
            href="/dashboard/products/add"
            className="btn-brand inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm"
          >
            Add Product
          </Link>
        ) : null}
      </div>

      {loadError ? (
        <p className="text-sm text-destructive">
          Unable to load products for this subcategory. Please refresh and try again.
        </p>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border px-4 py-8">
          <p className="text-sm text-muted-foreground">No products in this subcategory yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        </div>
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
    </Card>
  );
}
