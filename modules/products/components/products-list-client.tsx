"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { ProductCard } from "@/modules/products/components/product-card";
import { useDeleteProduct } from "@/modules/products/hooks/use-delete-product";
import type { Product, ProductListData } from "@/modules/products/types";
import { Card } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Pagination } from "@/shared/components/ui/pagination";

interface ProductsListClientProps {
  initialData: ProductListData;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function ProductsListClient({ initialData }: ProductsListClientProps) {
  const { products, pagination } = initialData;
  const { canWrite } = usePermissions();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const deleteProduct = useDeleteProduct({
    onSuccess: (response) => {
      setProductToDelete(null);
      setFeedback({
        type: "success",
        message: response.message || "Product deleted successfully.",
      });
    },
    onError: (error) => {
      setProductToDelete(null);
      setFeedback({
        type: "error",
        message: error.message || "Failed to delete product. Please try again.",
      });
    },
  });

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleDeleteConfirm = () => {
    if (!productToDelete) {
      return;
    }

    deleteProduct.mutate(productToDelete.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle mt-1">
            Manage product offerings and related media.
          </p>
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

      {feedback ? (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      {products.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-base font-medium text-foreground">No products yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first product to start building your offerings catalog.
          </p>
          {canWrite ? (
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
            basePath="/dashboard/products"
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
