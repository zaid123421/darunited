"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { useDeleteSubcategory } from "@/modules/subcategories/hooks/use-delete-subcategory";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import {
  getSubcategoryCategoryId,
  getSubcategoryCategoryTitle,
  getSubcategoryPicUrl,
} from "@/modules/subcategories/lib/subcategory-media-mappers";
import type { SubcategoryDetail } from "@/modules/subcategories/types";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";

interface ShowSubcategoryPageProps {
  subcategory: SubcategoryDetail;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function ShowSubcategoryPage({ subcategory }: ShowSubcategoryPageProps) {
  const router = useRouter();
  const { canWrite } = usePermissions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const picUrl = getSubcategoryPicUrl(subcategory);
  const categoryId = getSubcategoryCategoryId(subcategory);
  const categoryTitle = getSubcategoryCategoryTitle(subcategory);

  const deleteSubcategory = useDeleteSubcategory({
    onSuccess: () => {
      setShowDeleteDialog(false);
      router.push("/dashboard/subcategories");
    },
    onError: (error) => {
      setShowDeleteDialog(false);
      setFeedback({
        type: "error",
        message:
          error.message || "Failed to delete subcategory. Please try again.",
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
    deleteSubcategory.mutate(subcategory.id);
  };

  const hasDescription = Boolean(subcategory.description?.trim());

  return (
    <div className="flex min-h-full w-full flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/subcategories"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Subcategories
          </Link>

          <h1 className="page-title mt-4">{subcategory.title}</h1>
          <p className="page-subtitle mt-1">Subcategory details</p>
        </div>

        {canWrite ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/subcategories/${subcategory.id}/edit`}
              className="btn-brand-outline inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm"
              aria-label={`Edit ${subcategory.title}`}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              className="btn-destructive-outline inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm"
              aria-label={`Delete ${subcategory.title}`}
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
          Subcategory Information
        </CardTitle>

        <dl className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Title
            </dt>
            <dd className="text-base font-medium text-foreground">
              {subcategory.title}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Category
            </dt>
            <dd className="text-base font-medium text-foreground">
              {categoryId ? (
                <Link
                  href={`/dashboard/categories/${categoryId}`}
                  className="transition-colors hover:text-primary"
                >
                  {categoryTitle || `Category #${categoryId}`}
                </Link>
              ) : (
                <span className="text-muted-foreground">No category linked.</span>
              )}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium text-muted-foreground">
              Description
            </dt>
            <dd className="text-sm leading-relaxed text-foreground">
              {hasDescription ? (
                <span className="whitespace-pre-wrap">
                  {subcategory.description}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No description provided.
                </span>
              )}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-4 sm:p-6">
        <CardTitle className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">
          Main Thumbnail
        </CardTitle>

        {picUrl ? (
          <div className="aspect-video w-full max-w-xl overflow-hidden rounded-xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={picUrl}
              alt={`${subcategory.title} main thumbnail`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No main thumbnail uploaded.
          </p>
        )}
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete subcategory?"
        description={`Are you sure you want to delete "${subcategory.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteSubcategory.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteSubcategory.isPending) {
            setShowDeleteDialog(false);
          }
        }}
      />
    </div>
  );
}
