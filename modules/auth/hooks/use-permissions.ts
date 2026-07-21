"use client";

import { useCurrentUser } from "@/modules/auth/hooks/use-current-user";
import {
  canAccessDashboard,
  canWriteContent,
  normalizeRole,
} from "@/shared/lib/auth/roles";

export function usePermissions() {
  const user = useCurrentUser();
  const role = normalizeRole(user?.role);

  return {
    user,
    role,
    canAccessDashboard: canAccessDashboard(role),
    canWrite: canWriteContent(role),
    isAnalyst: role === "analyst",
    isSuperAdmin: role === "super_admin",
    isUser: role === "user",
  };
}
