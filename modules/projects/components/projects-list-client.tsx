"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { ProjectCard } from "@/modules/projects/components/project-card";
import { ProjectListRow } from "@/modules/projects/components/project-list-row";
import { ProjectTableRow } from "@/modules/projects/components/project-table-row";
import { ProjectsSearchForm } from "@/modules/projects/components/projects-search-form";
import { ProjectsViewToggle } from "@/modules/projects/components/projects-view-toggle";
import { useDeleteProject } from "@/modules/projects/hooks/use-delete-project";
import { useProjectsViewMode } from "@/modules/projects/hooks/use-projects-view-mode";
import { buildProjectsListBasePath } from "@/modules/projects/lib/build-projects-list-path";
import type { ProjectListData, ServiceOption } from "@/modules/projects/types";
import { Card } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Pagination } from "@/shared/components/ui/pagination";

interface ProjectsListClientProps {
  initialData: ProjectListData;
  services: ServiceOption[];
  filters: {
    title?: string;
    description?: string;
    clientName?: string;
    serviceId?: string;
    actualProjectDate?: string;
    fromDate?: string;
    toDate?: string;
  };
  isSearchActive: boolean;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function ProjectsListClient({
  initialData,
  services,
  filters,
  isSearchActive,
}: ProjectsListClientProps) {
  const { projects, pagination } = initialData;
  const { viewMode, setViewMode } = useProjectsViewMode();
  const { canWrite } = usePermissions();
  const [projectToDelete, setProjectToDelete] = useState<
    (typeof projects)[number] | null
  >(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const deleteProject = useDeleteProject({
    onSuccess: (response) => {
      setProjectToDelete(null);
      setFeedback({
        type: "success",
        message: response.message || "Project deleted successfully.",
      });
    },
    onError: (error) => {
      setProjectToDelete(null);
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
    if (!projectToDelete) {
      return;
    }

    deleteProject.mutate(projectToDelete.id);
  };

  const paginationBasePath = `/dashboard/projects${buildProjectsListBasePath(filters)}`;

  const renderDeleteHandler = (project: (typeof projects)[number]) => () => {
    setProjectToDelete(project);
  };

  const resultsSummary =
    pagination.from !== null && pagination.to !== null
      ? `Showing ${pagination.from}–${pagination.to} of ${pagination.total} projects`
      : `${pagination.total} project${pagination.total === 1 ? "" : "s"}`;

  const renderProjects = () => {
    if (viewMode === "list") {
      return (
        <div className="flex flex-col gap-2">
          {projects.map((project) => (
            <ProjectListRow
              key={project.id}
              project={project}
              onDelete={renderDeleteHandler(project)}
            />
          ))}
        </div>
      );
    }

    if (viewMode === "details") {
      return (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 w-16" />
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <ProjectTableRow
                    key={project.id}
                    project={project}
                    onDelete={renderDeleteHandler(project)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {projects.map((project) => (
              <ProjectListRow
                key={project.id}
                project={project}
                onDelete={renderDeleteHandler(project)}
              />
            ))}
          </div>
        </>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={renderDeleteHandler(project)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle mt-1">
            Search, filter, and manage portfolio projects.
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/projects/add"
            className="btn-brand inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm sm:w-auto"
          >
            Add Project
          </Link>
        ) : null}
      </div>

      <ProjectsSearchForm initialFilters={filters} services={services} />

      {feedback ? (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-base font-medium text-foreground">
            {isSearchActive ? "No projects match your filters" : "No projects yet"}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {isSearchActive
              ? "Try adjusting your search criteria or clear the filters."
              : "Create your first project to start building your portfolio."}
          </p>
          {!isSearchActive && canWrite ? (
            <Link
              href="/dashboard/projects/add"
              className="btn-brand mt-2 inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm"
            >
              Add Project
            </Link>
          ) : null}
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{resultsSummary}</p>
            <ProjectsViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>

          {renderProjects()}
        </>
      )}

      {pagination.total > 0 ? (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          hasMore={pagination.has_more}
          basePath={paginationBasePath}
          itemLabel="projects"
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(projectToDelete)}
        title="Delete project?"
        description={`Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteProject.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleteProject.isPending) {
            setProjectToDelete(null);
          }
        }}
      />
    </div>
  );
}
