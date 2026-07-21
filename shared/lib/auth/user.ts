import {
  canAccessDashboard,
  canWriteContent,
  normalizeRole,
  type UserRole,
} from "@/shared/lib/auth/roles";

export function getUserInitials(userName: string): string {
  return userName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function toStoredAuthUser(user: {
  user_name: string;
  role: string;
}) {
  return {
    user_name: user.user_name,
    role: normalizeRole(user.role) ?? user.role,
  };
}

export function resolvePostLoginPath(
  role: string | UserRole | null | undefined,
  redirect?: string | null,
): string {
  const normalized = normalizeRole(role);

  if (!canAccessDashboard(normalized)) {
    return "/";
  }

  if (redirect?.startsWith("/dashboard")) {
    if (
      !canWriteContent(normalized) &&
      (redirect.includes("/add") ||
        redirect.endsWith("/edit") ||
        redirect.includes("/edit/"))
    ) {
      return "/dashboard";
    }

    return redirect;
  }

  return redirect && redirect.startsWith("/") ? redirect : "/dashboard";
}
