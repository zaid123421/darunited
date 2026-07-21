"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import type { ProjectListItem } from "@/modules/projects/types";
import { PROJECT_STATUSES } from "@/modules/projects/constants";
import { cn } from "@/shared/lib/cn";

interface ProjectCardProps {
  project: ProjectListItem;
  onDelete: () => void;
}

function getStatusLabel(status: ProjectListItem["status"]) {
  return PROJECT_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const { canWrite } = usePermissions();
  const hasImage = Boolean(project.mainImageUrl);

  return (
    <article className="group card-lift overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="absolute inset-0 block"
          aria-label={`View ${project.title}`}
        >
          {hasImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${project.mainImageUrl})` }}
              role="img"
              aria-label={project.title}
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/35 via-accent/20 to-background"
              aria-hidden
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

          <div className="absolute left-3 top-3 z-10">
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              {getStatusLabel(project.status)}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">
              {project.title}
            </h3>
            <p className="mt-1 text-xs text-white/80">
              {project.clientName} · {project.service}
            </p>
            <p className="mt-0.5 text-[11px] text-white/65">
              {project.actualProjectDate}
            </p>
          </div>
        </Link>

        {canWrite ? (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <Link
              href={`/dashboard/projects/${project.id}/edit`}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15",
                "bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-primary hover:text-primary",
              )}
              aria-label={`Edit ${project.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15",
                "bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-primary hover:text-primary",
              )}
              aria-label={`Delete ${project.title}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
