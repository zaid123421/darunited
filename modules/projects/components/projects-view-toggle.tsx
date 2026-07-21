"use client";

import { LayoutGrid, List, Table2 } from "lucide-react";
import type { ProjectsViewMode } from "@/modules/projects/types";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/cn";

const VIEW_OPTIONS: {
  mode: ProjectsViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { mode: "grid", label: "Grid view", icon: LayoutGrid },
  { mode: "list", label: "List view", icon: List },
  { mode: "details", label: "Details view", icon: Table2 },
];

interface ProjectsViewToggleProps {
  viewMode: ProjectsViewMode;
  onViewModeChange: (mode: ProjectsViewMode) => void;
}

export function ProjectsViewToggle({
  viewMode,
  onViewModeChange,
}: ProjectsViewToggleProps) {
  return (
    <div
      className="inline-flex items-center rounded-lg border border-border bg-card p-1"
      role="group"
      aria-label="Projects view mode"
    >
      {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => {
        const isActive = viewMode === mode;

        return (
          <Button
            key={mode}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="icon"
            aria-label={label}
            aria-pressed={isActive}
            className={cn(
              "h-8 w-8 rounded-md",
              isActive && "bg-muted shadow-sm",
            )}
            onClick={() => onViewModeChange(mode)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}
