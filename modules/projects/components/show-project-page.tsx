"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Pencil, Trash2, Video } from "lucide-react";
import { useDeleteProject } from "@/modules/projects/hooks/use-delete-project";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import {
  formatProjectDisplayDate,
  getGalleryFromProject,
  getMainPicFromProject,
  isVideoMedia,
} from "@/modules/projects/lib/project-media-mappers";
import { PROJECT_STATUSES } from "@/modules/projects/constants";
import type { ProjectDetail, ProjectMedia } from "@/modules/projects/types";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Pagination } from "@/shared/components/ui/pagination";
import { cn } from "@/shared/lib/cn";

interface ShowProjectPageProps {
  project: ProjectDetail;
  mainPic?: ProjectMedia;
  mediaBasePath: string;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

function getStatusLabel(status: ProjectDetail["status"]) {
  return PROJECT_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function ShowProjectPage({
  project,
  mainPic,
  mediaBasePath,
}: ShowProjectPageProps) {
  const router = useRouter();
  const { canWrite } = usePermissions();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const resolvedMainPic = mainPic ?? getMainPicFromProject(project);
  const galleryItems = getGalleryFromProject(project);
  const pagination = project.pagination;

  const deleteProject = useDeleteProject({
    onSuccess: () => {
      setShowDeleteDialog(false);
      router.push("/dashboard/projects");
    },
    onError: (error) => {
      setShowDeleteDialog(false);
      setFeedback({
        type: "error",
        message: error.message || "Failed to delete project. Please try again.",
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
    deleteProject.mutate(project.id);
  };

  return (
    <div className="flex min-h-full w-full flex-col gap-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          <h1 className="page-title mt-4">{project.title}</h1>
          <p className="page-subtitle mt-1">
            Project details and media gallery
          </p>
        </div>

        {canWrite ? (
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/projects/${project.id}/edit`}
              className="btn-brand-outline inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm"
              aria-label={`Edit ${project.title}`}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              className="btn-destructive-outline inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm"
              aria-label={`Delete ${project.title}`}
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
          Project Information
        </CardTitle>

        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Title
            </dt>
            <dd className="text-base font-medium text-foreground">{project.title}</dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Status
            </dt>
            <dd className="text-base font-medium text-foreground">
              {getStatusLabel(project.status)}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium text-muted-foreground">Client Name</dt>
            <dd className="text-sm text-foreground">{project.clientName}</dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium text-muted-foreground">Client Region</dt>
            <dd className="text-sm text-foreground">{project.clientRegion}</dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium text-muted-foreground">Service</dt>
            <dd className="text-sm text-foreground">{project.service}</dd>
          </div>

          <div className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium text-muted-foreground">Project Date</dt>
            <dd className="text-sm text-foreground">
              {formatProjectDisplayDate(project.actualProjectDate)}
            </dd>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">Description</dt>
            <dd className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {project.description?.trim()
                ? project.description
                : "No description provided."}
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
              alt={`${project.title} main thumbnail`}
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
            {project.media
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
        title="Delete project?"
        description={`Are you sure you want to delete "${project.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteProject.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteProject.isPending) {
            setShowDeleteDialog(false);
          }
        }}
      />
    </div>
  );
}
