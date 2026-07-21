"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { SubcategoryCard } from "@/modules/subcategories/components/subcategory-card";
import { useDeleteSubcategory } from "@/modules/subcategories/hooks/use-delete-subcategory";
import type { Subcategory, SubcategoryListData } from "@/modules/subcategories/types";
import { Card } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Pagination } from "@/shared/components/ui/pagination";

interface SubcategoriesListClientProps {
  initialData: SubcategoryListData;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function SubcategoriesListClient({ initialData }: SubcategoriesListClientProps) {
  const { subcategories, pagination } = initialData;
  const { canWrite } = usePermissions();
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

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
        message: error.message || "Failed to delete subcategory. Please try again.",
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Subcategories</h1>
          <p className="page-subtitle mt-1">
            Manage subcategory offerings and related media.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/subcategories/add"
            className="btn-brand inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm sm:w-auto"
          >
            Add Subcategory
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

      {subcategories.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-base font-medium text-foreground">No subcategories yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create your first subcategory to start building your offerings catalog.
          </p>
          {canWrite ? (
            <Link
              href="/dashboard/subcategories/add"
              className="btn-brand mt-2 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm"
            >
              Add Subcategory
            </Link>
          ) : null}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {subcategories.map((subcategory) => (
              <SubcategoryCard
                key={subcategory.id}
                subcategory={subcategory}
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
            basePath="/dashboard/subcategories"
            itemLabel="subcategories"
          />
        </>
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
    </div>
  );
}
