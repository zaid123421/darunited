"use client";

import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { ServiceProjectCard } from "@/modules/services/components/service-project-card";
import type { ServiceProjectsListData } from "@/modules/services/types";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Pagination } from "@/shared/components/ui/pagination";

interface ServiceProjectsSectionProps {
  data: ServiceProjectsListData | null;
  projectsBasePath: string;
  loadError?: boolean;
}

export function ServiceProjectsSection({
  data,
  projectsBasePath,
  loadError = false,
}: ServiceProjectsSectionProps) {
  const { canWrite } = usePermissions();
  const projects = data?.projects ?? [];
  const pagination = data?.pagination;

  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-sm font-semibold sm:text-base">
            Related Projects
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Portfolio projects linked to this service.
          </p>
        </div>

        {canWrite ? (
          <Link
            href="/dashboard/projects/add"
            className="btn-brand-outline inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm"
          >
            Add Project
          </Link>
        ) : null}
      </div>

      {loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
          <p className="text-sm text-destructive">
            Unable to load related projects. Please refresh the page or try again later.
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground">No projects yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Projects assigned to this service will appear here.
            </p>
          </div>
          {canWrite ? (
            <Link
              href="/dashboard/projects/add"
              className="btn-brand mt-1 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm"
            >
              Add Project
            </Link>
          ) : null}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {projects.map((project) => (
              <ServiceProjectCard key={project.id} project={project} />
            ))}
          </div>

          {pagination && pagination.total > 0 ? (
            <div className="mt-6 border-t border-border pt-6">
              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                total={pagination.total}
                from={pagination.from}
                to={pagination.to}
                hasMore={pagination.has_more}
                basePath={projectsBasePath}
                pageParam="projects_page"
                itemLabel="projects"
              />
            </div>
          ) : null}
        </>
      )}
    </Card>
  );
}
