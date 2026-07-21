import { clearSessionCookies, getSessionCookies } from "@/shared/lib/cookies";
import { performTokenRefresh } from "@/shared/lib/auth/session";
import { env } from "@/shared/config/env";
import type { ApiErrorBody, GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

export interface ProxyOptions {
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  authToken?: string | null;
  isFormData?: boolean;
}

export async function proxyToBackend<T>(
  path: string,
  options: ProxyOptions = {},
): Promise<{ status: number; data: GlobalResponse<T> }> {
  const { method = "GET", body, headers = {}, authToken, isFormData } = options;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (!isFormData && body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
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

  let data: GlobalResponse<T> | ApiErrorBody;

  try {
    data = (await response.json()) as GlobalResponse<T> | ApiErrorBody;
  } catch {
    throw new ApiError("Invalid response from backend", response.status);
  }

  if (!response.ok) {
    const errorBody = data as ApiErrorBody;
    throw new ApiError(
      errorBody.message ?? "Request failed",
      errorBody.status_code ?? response.status,
      errorBody.errors,
    );
  }

  return {
    status: response.status,
    data: data as GlobalResponse<T>,
  };
}

export async function proxyWithSessionAuth<T>(
  path: string,
  options: Omit<ProxyOptions, "authToken"> = {},
  hasRetried = false,
): Promise<{ status: number; data: GlobalResponse<T> }> {
  const { accessToken } = await getSessionCookies();

  if (!accessToken) {
    if (!hasRetried) {
      try {
        await performTokenRefresh();
        return proxyWithSessionAuth(path, options, true);
      } catch {
        await clearSessionCookies();
        throw new ApiError("Unauthenticated.", 401);
      }
    }

    throw new ApiError("Unauthenticated.", 401);
  }

  try {
    return await proxyToBackend<T>(path, {
      ...options,
      authToken: accessToken,
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.statusCode === 401 &&
      !hasRetried
    ) {
      try {
        await performTokenRefresh();
        return proxyWithSessionAuth(path, options, true);
      } catch {
        await clearSessionCookies();
      }
    }

    throw error;
  }
}

export function jsonResponse<T>(data: GlobalResponse<T>, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        status_code: error.statusCode,
        message: error.message,
        errors: error.errors,
        data: null,
      },
      { status: error.statusCode },
    );
  }

  return Response.json(
    {
      status_code: 500,
      message: "Internal server error",
      data: null,
    },
    { status: 500 },
  );
}
