"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Pencil, Trash2, Video } from "lucide-react";
import { useDeleteProduct } from "@/modules/products/hooks/use-delete-product";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import {
  getGalleryFromProduct,
  getMainPicFromProduct,
  isVideoMedia,
} from "@/modules/products/lib/product-media-mappers";
import type { ProductDetail, ProductMedia } from "@/modules/products/types";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Pagination } from "@/shared/components/ui/pagination";

interface ShowProductPageProps {
  product: ProductDetail;
  mainPic?: ProductMedia;
  mediaBasePath: string;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function ShowProductPage({
  product,
  mainPic,
  mediaBasePath,
}: ShowProductPageProps) {
  const router = useRouter();
  const { canWrite } = usePermissions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const resolvedMainPic = mainPic ?? getMainPicFromProduct(product);
  const galleryItems = getGalleryFromProduct(product);
  const pagination = product.pagination;

  const deleteProduct = useDeleteProduct({
    onSuccess: () => {
      setShowDeleteDialog(false);
      router.push("/dashboard/products");
    },
    onError: (error) => {
      setShowDeleteDialog(false);
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
    deleteProduct.mutate(product.id);
  };

  const hasDescription = Boolean(product.description?.trim());

  return (
    <div className="flex min-h-full w-full flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <h1 className="page-title mt-4">{product.title}</h1>
          <p className="page-subtitle mt-1">
            Product details and media gallery
          </p>
        </div>

        {canWrite ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/products/${product.id}/edit`}
              className="btn-brand-outline inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm"
              aria-label={`Edit ${product.title}`}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              className="btn-destructive-outline inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm"
              aria-label={`Delete ${product.title}`}
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {feedback ? (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      <Card className="p-4 sm:p-6">
        <CardTitle className="mb-4 text-sm font-semibold sm:mb-6 sm:text-base">
          Product Information
        </CardTitle>

        <dl className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Title
            </dt>
            <dd className="text-base font-medium text-foreground">{product.title}</dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium text-muted-foreground">Description</dt>
            <dd className="text-sm leading-relaxed text-foreground">
              {hasDescription ? (
                <span className="whitespace-pre-wrap">{product.description}</span>
              ) : (
                <span className="text-muted-foreground">No description provided.</span>
              )}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-4 sm:p-6">
        <CardTitle className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">
          Main Thumbnail
        </CardTitle>

        {resolvedMainPic ? (
          <div className="aspect-video w-full max-w-xl overflow-hidden rounded-xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedMainPic.url}
              alt={`${product.title} main thumbnail`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No main thumbnail uploaded.</p>
        )}
      </Card>

      <Card className="p-4 sm:p-6">
        <CardTitle className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">
          Gallery Media
        </CardTitle>

        {galleryItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No gallery media uploaded.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {product.media
              .filter((item) => item.role === "gallery")
              .sort((left, right) => left.order - right.order)
              .map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                >
                  {isVideoMedia(item) ? (
                    <>
                      <video
                        src={item.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <Video className="h-8 w-8 text-white drop-shadow" />
                      </div>
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.file_name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ))}
          </div>
        )}

        {pagination && pagination.total > 0 ? (
          <div className="mt-6 border-t border-border pt-6">
            <Pagination
              currentPage={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              from={pagination.from}
              to={pagination.to}
              hasMore={pagination.has_more}
              basePath={mediaBasePath}
              itemLabel="media items"
            />
          </div>
        ) : null}
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete product?"
        description={`Are you sure you want to delete "${product.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteProduct.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteProduct.isPending) {
            setShowDeleteDialog(false);
          }
        }}
      />
    </div>
  );
}
