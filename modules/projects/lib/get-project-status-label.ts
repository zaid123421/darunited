import { PROJECT_STATUSES } from "@/modules/projects/constants";
import type { ProjectStatus } from "@/modules/projects/types";

export function getProjectStatusLabel(status: ProjectStatus) {
  return PROJECT_STATUSES.find((item) => item.value === status)?.label ?? status;
}
