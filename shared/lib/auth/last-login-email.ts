const LAST_LOGIN_EMAIL_KEY = "du_last_login_email";

export function getLastLoginEmail(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(LAST_LOGIN_EMAIL_KEY) ?? "";
}

export function setLastLoginEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = email.trim();
  if (!trimmed) {
    return;
  }

  window.localStorage.setItem(LAST_LOGIN_EMAIL_KEY, trimmed);
}
