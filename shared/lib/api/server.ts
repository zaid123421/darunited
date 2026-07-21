import { clearSessionCookies, getSessionCookies } from "@/shared/lib/cookies";
import { performTokenRefresh } from "@/shared/lib/auth/session";
import { env } from "@/shared/config/env";
import type { GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

export interface ServerFetchOptions {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  auth?: boolean;
  isFormData?: boolean;
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
  hasRetried = false,
): Promise<GlobalResponse<T>> {
  const { method = "GET", body, headers = {}, auth = true, isFormData } =
    options;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (!isFormData && body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const { accessToken } = await getSessionCookies();
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${env.BACKEND_API_URL}${path}`, {
    method,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as BodyInit)
          : JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json()) as GlobalResponse<T>;

  if (!response.ok) {
    if (auth && response.status === 401 && !hasRetried) {
      try {
        await performTokenRefresh();
        return serverFetch<T>(path, options, true);
      } catch {
        await clearSessionCookies();
      }
    }

    throw new ApiError(
      data.message ?? "Request failed",
      data.status_code ?? response.status,
    );
  }

  return data;
}
