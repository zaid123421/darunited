"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { CategoryCard } from "@/modules/categories/components/category-card";
import { useDeleteCategory } from "@/modules/categories/hooks/use-delete-category";
import type { Category, CategoryListData } from "@/modules/categories/types";
import { Card } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Pagination } from "@/shared/components/ui/pagination";

interface CategoriesListClientProps {
  initialData: CategoryListData;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function CategoriesListClient({ initialData }: CategoriesListClientProps) {
  const { categories, pagination } = initialData;
  const { canWrite } = usePermissions();
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const deleteCategory = useDeleteCategory({
    onSuccess: (response) => {
      setCategoryToDelete(null);
      setFeedback({
        type: "success",
        message: response.message || "Category deleted successfully.",
      });
    },
    onError: (error) => {
      setCategoryToDelete(null);
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
    if (!categoryToDelete) {
      return;
    }

    deleteCategory.mutate(categoryToDelete.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle mt-1">
            Manage category offerings and related media.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/categories/add"
            className="btn-brand inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm sm:w-auto"
          >
            Add Category
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

      {categories.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-base font-medium text-foreground">No categories yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first category to start building your offerings catalog.
          </p>
          {canWrite ? (
            <Link
              href="/dashboard/categories/add"
              className="btn-brand mt-2 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm"
            >
              Add Category
            </Link>
          ) : null}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onDelete={() => setCategoryToDelete(category)}
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
            basePath="/dashboard/categories"
            itemLabel="categories"
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        title="Delete category?"
        description={
          categoryToDelete
            ? `Are you sure you want to delete "${categoryToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteCategory.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteCategory.isPending) {
            setCategoryToDelete(null);
          }
        }}
      />
    </div>
  );
}
