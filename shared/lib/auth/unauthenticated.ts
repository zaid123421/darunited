import { clientSession } from "@/shared/lib/auth/client-session";
import { ApiError } from "@/shared/types/global-response";

function isAuthPath(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/otp");
}

export function handleClientUnauthenticated() {
  if (typeof window === "undefined") {
    return;
  }

  if (isAuthPath(window.location.pathname)) {
    return;
  }

  clientSession.clear();

  const redirect = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.assign(`/login?redirect=${redirect}`);
}

export function throwUnauthenticatedError(): never {
  handleClientUnauthenticated();
  throw new ApiError("Unauthenticated.", 401);
}
