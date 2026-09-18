"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { SubcategoryCard } from "@/modules/subcategories/components/subcategory-card";
import { useDeleteSubcategory } from "@/modules/subcategories/hooks/use-delete-subcategory";
import type {
  Subcategory,
  SubcategoryListData,
} from "@/modules/subcategories/types";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Pagination } from "@/shared/components/ui/pagination";

interface CategorySubcategoriesSectionProps {
  categoryId: number;
  data: SubcategoryListData;
  loadError?: boolean;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function CategorySubcategoriesSection({
  categoryId,
  data,
  loadError = false,
}: CategorySubcategoriesSectionProps) {
  const { subCategories, pagination } = data;
  const { canWrite } = usePermissions();
  const [subcategoryToDelete, setSubcategoryToDelete] =
    useState<Subcategory | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const addHref = `/dashboard/subcategories/add?categoryId=${categoryId}`;
  const paginationBasePath = `/dashboard/categories/${categoryId}`;

  const deleteSubcategory = useDeleteSubcategory({
    onSuccess: (response) => {
      setSubcategoryToDelete(null);
      setFeedback({
        type: "success",
        message: response.message || "Subcategory deleted successfully.",
      });
    },
    onError: (error) => {
      setSubcategoryToDelete(null);
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
    if (!subcategoryToDelete) {
      return;
    }

    deleteSubcategory.mutate(subcategoryToDelete.id);
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-sm font-semibold sm:text-base">
          Subcategories
        </CardTitle>
        {canWrite ? (
          <Link
            href={addHref}
            className="btn-brand inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm"
          >
            Add Subcategory
          </Link>
        ) : null}
      </div>

      {feedback ? (
        <div className="mb-4">
          <FeedbackBanner
            type={feedback.type}
            message={feedback.message}
            onDismiss={() => setFeedback(null)}
          />
        </div>
      ) : null}

      {loadError ? (
        <p className="text-sm text-destructive">
          Unable to load subcategories for this category. Please refresh and try
          again.
        </p>
      ) : subCategories.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border px-4 py-8">
          <p className="text-sm text-muted-foreground">
            No subcategories under this category yet.
          </p>
          {canWrite ? (
            <Link
              href={addHref}
              className="btn-brand inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm"
            >
              Add Subcategory
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {subCategories.map((subcategory) => (
              <SubcategoryCard
                key={subcategory.id}
                subcategory={subcategory}
                showCategory={false}
                onDelete={() => setSubcategoryToDelete(subcategory)}
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
            itemLabel="subcategories"
          />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(subcategoryToDelete)}
        title="Delete subcategory?"
        description={
          subcategoryToDelete
            ? `Are you sure you want to delete "${subcategoryToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteSubcategory.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteSubcategory.isPending) {
            setSubcategoryToDelete(null);
          }
        }}
      />
    </Card>
  );
}
