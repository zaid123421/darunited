"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { CategorySubcategoriesSection } from "@/modules/categories/components/category-subcategories-section";
import { useDeleteCategory } from "@/modules/categories/hooks/use-delete-category";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { getCategoryPicUrl } from "@/modules/categories/lib/category-media-mappers";
import type { CategoryDetail } from "@/modules/categories/types";
import type { SubcategoryListData } from "@/modules/subcategories/types";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";

interface ShowCategoryPageProps {
  category: CategoryDetail;
  subcategories: SubcategoryListData;
  subcategoriesLoadError?: boolean;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function ShowCategoryPage({
  category,
  subcategories,
  subcategoriesLoadError = false,
}: ShowCategoryPageProps) {
  const router = useRouter();
  const { canWrite } = usePermissions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const picUrl = getCategoryPicUrl(category);

  const deleteCategory = useDeleteCategory({
    onSuccess: () => {
      setShowDeleteDialog(false);
      router.push("/dashboard/categories");
    },
    onError: (error) => {
      setShowDeleteDialog(false);
      setFeedback({
        type: "error",
        message: error.message || "Failed to delete category. Please try again.",
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
    deleteCategory.mutate(category.id);
  };

  const hasDescription = Boolean(category.description?.trim());

  return (
    <div className="flex min-h-full w-full flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/categories"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Categories
          </Link>

          <h1 className="page-title mt-4">{category.title}</h1>
          <p className="page-subtitle mt-1">Category details</p>
        </div>

        {canWrite ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/categories/${category.id}/edit`}
              className="btn-brand-outline inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm"
              aria-label={`Edit ${category.title}`}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              className="btn-destructive-outline inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm"
              aria-label={`Delete ${category.title}`}
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
          Category Information
        </CardTitle>

        <dl className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Title
            </dt>
            <dd className="text-base font-medium text-foreground">
              {category.title}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium text-muted-foreground">
              Description
            </dt>
            <dd className="text-sm leading-relaxed text-foreground">
              {hasDescription ? (
                <span className="whitespace-pre-wrap">
                  {category.description}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  No description available from the API.
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
              alt={`${category.title} main thumbnail`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No main thumbnail uploaded.
          </p>
        )}
      </Card>

      <CategorySubcategoriesSection
        categoryId={category.id}
        data={subcategories}
        loadError={subcategoriesLoadError}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete category?"
        description={`Are you sure you want to delete "${category.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteCategory.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteCategory.isPending) {
            setShowDeleteDialog(false);
          }
        }}
      />
    </div>
  );
}
