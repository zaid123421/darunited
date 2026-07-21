const BLOCKED_PREFIXES = ["/login", "/otp", "/api"];

export function getSafeDashboardRedirect(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  if (!value.startsWith("/dashboard")) {
    return null;
  }

  if (BLOCKED_PREFIXES.some((prefix) => value.startsWith(prefix))) {
    return null;
  }

  return value;
}
