export const USER_ROLES = ["super_admin", "analyst", "user"] as const;

export type UserRole = (typeof USER_ROLES)[number];

const ROLE_ALIASES: Record<string, UserRole> = {
  super_admin: "super_admin",
  "super-admin": "super_admin",
  superadmin: "super_admin",
  "super admin": "super_admin",
  admin: "super_admin",
  analyst: "analyst",
  user: "user",
};

export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) {
    return null;
  }

  const key = role.trim().toLowerCase().replace(/\s+/g, " ");
  return ROLE_ALIASES[key] ?? ROLE_ALIASES[key.replace(/[\s-]+/g, "_")] ?? null;
}

export function canAccessDashboard(role: UserRole | null | undefined): boolean {
  return role === "super_admin" || role === "analyst";
}

export function canWriteContent(role: UserRole | null | undefined): boolean {
  return role === "super_admin";
}

export function isDashboardWritePath(pathname: string): boolean {
  return (
    pathname.includes("/add") ||
    pathname.endsWith("/edit") ||
    pathname.includes("/edit/")
  );
}
