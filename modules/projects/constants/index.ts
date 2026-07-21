import type { ProjectsViewMode } from "@/modules/projects/types";

export const PROJECTS_VIEW_MODE_STORAGE_KEY = "mn-projects-view-mode";

export const DEFAULT_PROJECTS_VIEW_MODE: ProjectsViewMode = "grid";

export const PROJECTS_VIEW_MODES: ProjectsViewMode[] = ["grid", "list", "details"];

export const PROJECT_STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
] as const;

export const PROJECT_FORM_DEFAULTS = {
  title: "",
  clientName: "",
  clientRegion: "",
  serviceId: 0,
  description: "",
  actualProjectDate: "",
  status: "draft" as const,
};
