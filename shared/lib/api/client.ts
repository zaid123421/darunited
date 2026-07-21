import { buildBackendApiUrl, env } from "@/shared/config/env";
import {
  refreshClientSession,
  shouldAttemptSessionRefresh,
} from "@/shared/lib/auth/client-refresh";
import { clientSession } from "@/shared/lib/auth/client-session";
import { handleClientUnauthenticated } from "@/shared/lib/auth/unauthenticated";
import type { ApiErrorBody, GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

function isSessionSyncPath(path: string) {
  return path.startsWith("/api/auth/session/");
}

function shouldUseDirectBackend(path: string) {
  if (!env.USE_DIRECT_BACKEND_API || isSessionSyncPath(path)) {
    return false;
  }

  // Auth helpers already use `/auth/*`. Admin client calls use `/api/admin/*`
  // BFF paths; on Netlify the catch-all BFF route returns empty 500s, so send
  // those straight to Laravel with a Bearer token instead.
  return (
    path.startsWith("/auth/") ||
    path.startsWith("/api/admin/") ||
    path.startsWith("/admin/")
  );
}

function toBackendPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath.startsWith("/api/")) {
    return normalizedPath.slice(4);
  }

  return normalizedPath;
}

function resolveClientUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (shouldUseDirectBackend(path)) {
    return buildBackendApiUrl(toBackendPath(path));
  }

  return path;
}

function withDirectAuthHeaders(path: string, options: RequestInit): RequestInit {
  if (!shouldUseDirectBackend(path)) {
    return options;
  }

  const headers = new Headers(options.headers);
  if (headers.has("Authorization")) {
    return options;
  }

  const accessToken = clientSession.getAccessToken();

  if (!accessToken) {
    return options;
  }

  headers.set("Authorization", `Bearer ${accessToken}`);

  return {
    ...options,
    headers,
  };
}

function buildJsonRequestInit(path: string, options: RequestInit = {}) {
  const isDirectBackendRequest = shouldUseDirectBackend(path);

  return withDirectAuthHeaders(path, {
    ...options,
    credentials: isDirectBackendRequest ? "omit" : "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });
}

async function parseResponseBody<T>(
  response: Response,
): Promise<GlobalResponse<T> | ApiErrorBody> {
  const raw = await response.text();

  if (!raw) {
    throw new ApiError(
      response.status
        ? `Empty response from server (${response.status})`
        : "Empty response from server",
      response.status || 502,
    );
  }

  try {
    return JSON.parse(raw) as GlobalResponse<T> | ApiErrorBody;
  } catch {
    throw new ApiError(
      "Invalid JSON response from server",
      response.status || 502,
    );
  }
}

async function executeClientRequest<T>(
  path: string,
  request: () => Promise<Response>,
  hasRetried = false,
): Promise<GlobalResponse<T>> {
  const response = await request();
  const data = await parseResponseBody<T>(response);

  if (!response.ok) {
    const errorBody = data as ApiErrorBody;
    const statusCode = errorBody.status_code ?? response.status;

    if (statusCode === 401 && shouldAttemptSessionRefresh(path)) {
      if (!hasRetried) {
        const refreshed = await refreshClientSession();

        if (refreshed) {
          return executeClientRequest(path, request, true);
        }
      }

      handleClientUnauthenticated();
    }

    throw new ApiError(
      errorBody.message ?? "Request failed",
      statusCode,
      errorBody.errors,
    );
  }

  return data as GlobalResponse<T>;
}

export async function clientFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<GlobalResponse<T>> {
  const url = resolveClientUrl(path);

  return executeClientRequest<T>(path, () =>
    fetch(url, buildJsonRequestInit(path, options)),
  );
}

export async function clientUpload<T>(
  path: string,
  formData: FormData,
  options: Omit<RequestInit, "body" | "method"> = {},
): Promise<GlobalResponse<T>> {
  const url = resolveClientUrl(path);
  const isDirectBackendRequest = shouldUseDirectBackend(path);

  return executeClientRequest<T>(path, () =>
    fetch(url, withDirectAuthHeaders(path, {
      ...options,
      method: "POST",
      credentials: isDirectBackendRequest ? "omit" : "include",
      headers: {
        Accept: "application/json",
        ...(options.headers as Record<string, string>),
      },
      body: formData,
    })),
  );
}
