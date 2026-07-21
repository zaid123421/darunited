"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { ProjectListThumbnail } from "@/modules/projects/components/project-list-thumbnail";
import { getProjectStatusLabel } from "@/modules/projects/lib/get-project-status-label";
import type { ProjectListItem } from "@/modules/projects/types";

interface ProjectTableRowProps {
  project: ProjectListItem;
  onDelete: () => void;
}

export function ProjectTableRow({ project, onDelete }: ProjectTableRowProps) {
  const { canWrite } = usePermissions();

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3">
        <ProjectListThumbnail
          imageUrl={project.mainImageUrl}
          title={project.title}
          className="h-10 w-10"
        />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground">
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="transition-colors hover:text-primary"
        >
          {project.title}
        </Link>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{project.clientName}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{project.service}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {getProjectStatusLabel(project.status)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {project.actualProjectDate}
      </td>
      <td className="px-4 py-3 text-right">
        {canWrite ? (
          <div className="inline-flex items-center gap-1.5">
            <Link
              href={`/dashboard/projects/${project.id}/edit`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label={`Edit ${project.title}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary hover:text-primary"
              aria-label={`Delete ${project.title}`}
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </td>
    </tr>
  );
}
