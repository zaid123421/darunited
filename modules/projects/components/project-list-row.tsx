"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { ProjectListThumbnail } from "@/modules/projects/components/project-list-thumbnail";
import { getProjectStatusLabel } from "@/modules/projects/lib/get-project-status-label";
import type { ProjectListItem } from "@/modules/projects/types";
import { cn } from "@/shared/lib/cn";

interface ProjectListRowProps {
  project: ProjectListItem;
  onDelete: () => void;
}

export function ProjectListRow({ project, onDelete }: ProjectListRowProps) {
  const { canWrite } = usePermissions();

  return (
    <article className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/30 sm:gap-4 sm:p-4">
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
        aria-label={`View ${project.title}`}
      >
        <ProjectListThumbnail
          imageUrl={project.mainImageUrl}
          title={project.title}
          className="h-14 w-14 sm:h-16 sm:w-16"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
              {project.title}
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {getProjectStatusLabel(project.status)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
            {project.clientName} · {project.service}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
            {project.actualProjectDate}
          </p>
        </div>
      </Link>

      {canWrite ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href={`/dashboard/projects/${project.id}/edit`}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border",
              "bg-card text-foreground transition-colors hover:border-primary hover:text-primary",
            )}
            aria-label={`Edit ${project.title}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border",
              "bg-card text-foreground transition-colors hover:border-primary hover:text-primary",
            )}
            aria-label={`Delete ${project.title}`}
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </article>
  );
}
