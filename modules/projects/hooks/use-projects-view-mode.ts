"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PROJECTS_VIEW_MODE,
  PROJECTS_VIEW_MODE_STORAGE_KEY,
  PROJECTS_VIEW_MODES,
} from "@/modules/projects/constants";
import type { ProjectsViewMode } from "@/modules/projects/types";

function isProjectsViewMode(value: string | null): value is ProjectsViewMode {
  return value !== null && PROJECTS_VIEW_MODES.includes(value as ProjectsViewMode);
}

export function useProjectsViewMode() {
  const [viewMode, setViewModeState] = useState<ProjectsViewMode>(
    DEFAULT_PROJECTS_VIEW_MODE,
  );

  useEffect(() => {
    const stored = localStorage.getItem(PROJECTS_VIEW_MODE_STORAGE_KEY);
    if (isProjectsViewMode(stored)) {
      setViewModeState(stored);
    }
  }, []);

  const setViewMode = useCallback((mode: ProjectsViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(PROJECTS_VIEW_MODE_STORAGE_KEY, mode);
  }, []);

  return { viewMode, setViewMode };
}
