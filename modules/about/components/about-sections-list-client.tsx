"use client";

import Link from "next/link";
import { useState } from "react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { AboutSectionCard } from "@/modules/about/components/about-section-card";
import { useDeleteAboutSection } from "@/modules/about/hooks/use-delete-about-section";
import type { AboutUsListData, AboutUsSection } from "@/modules/about/types";
import { Card } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { Pagination } from "@/shared/components/ui/pagination";

interface AboutSectionsListClientProps {
  initialData: AboutUsListData;
}

export function AboutSectionsListClient({
  initialData,
}: AboutSectionsListClientProps) {
  const { sections, pagination } = initialData;
  const { canWrite } = usePermissions();
  const [sectionToDelete, setSectionToDelete] = useState<AboutUsSection | null>(
    null,
  );

  const deleteSection = useDeleteAboutSection({
    onSuccess: () => setSectionToDelete(null),
    onError: () => setSectionToDelete(null),
  });

  const handleDeleteConfirm = () => {
    if (!sectionToDelete) return;
    deleteSection.mutate(sectionToDelete.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">About Us</h1>
          <p className="page-subtitle mt-1">
            Manage sections displayed on the about page.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/about/add"
            className="btn-brand inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm sm:w-auto"
          >
            Add Section
          </Link>
        ) : null}
      </div>

      {sections.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-base font-medium text-foreground">No sections yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add your first about us section to get started.
          </p>
          {canWrite ? (
            <Link
              href="/dashboard/about/add"
              className="btn-brand mt-2 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm"
            >
              Add Section
            </Link>
          ) : null}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <AboutSectionCard
              key={section.id}
              section={section}
              onDelete={() => setSectionToDelete(section)}
            />
          ))}
        </div>
      )}

      {pagination.last_page > 1 ? (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          hasMore={pagination.has_more}
          basePath="/dashboard/about"
          itemLabel="sections"
        />
      ) : null}

      <ConfirmDialog
        open={sectionToDelete !== null}
        title="Delete section"
        description={
          sectionToDelete
            ? `Are you sure you want to delete "${sectionToDelete.title}"? This cannot be undone.`
            : "Are you sure you want to delete this section?"
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSectionToDelete(null)}
      />
    </div>
  );
}
