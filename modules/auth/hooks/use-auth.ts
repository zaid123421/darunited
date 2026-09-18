"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/modules/auth/api/auth.api";
import type { RequestCodePayload } from "@/shared/lib/auth/otp-debug";
import { resolvePostLoginPath } from "@/shared/lib/auth/user";
import { ApiError } from "@/shared/types/global-response";

type UseAuthOptions = {
  redirect?: string | null;
};

export const ME_QUERY_KEY = ["auth", "me"] as const;

function buildAuthUrl(
  path: "/otp" | "/login" | "/recover" | "/recover/otp" | "/recover/new-email" | "/recover/verify-new-email",
  redirect?: string | null,
): string {
  if (!redirect) {
    return path;
  }

  return `${path}?redirect=${encodeURIComponent(redirect)}`;
}

function redirectToLogin(router: ReturnType<typeof useRouter>, redirect?: string | null) {
  router.push(buildAuthUrl("/login", redirect));
}

export function useAuth(options: UseAuthOptions = {}) {
  const router = useRouter();
  const redirect = options.redirect ?? null;

  const requestCode = useMutation({
    mutationFn: (payload: RequestCodePayload) => authApi.requestCode(payload),
    onSuccess: (response) => {
      if (
        response.data &&
        typeof response.data === "object" &&
        "bypass" in response.data &&
        response.data.bypass &&
        "user" in response.data
      ) {
        router.push(
          resolvePostLoginPath(response.data.user.role, redirect),
        );
        return;
      }

      router.push(buildAuthUrl("/otp", redirect));
    },
  });

  const verifyCode = useMutation({
    mutationFn: (code: string) => authApi.verifyCode(code),
    onSuccess: (response) => {
      router.push(resolvePostLoginPath(response.data.user.role, redirect));
    },
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 401) {
        redirectToLogin(router, redirect);
      }
    },
  });

  const resendCode = useMutation({
    mutationFn: () => authApi.resendCode(),
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 401) {
        redirectToLogin(router, redirect);
      }
    },
  });

  const requestRecoveryCode = useMutation({
    mutationFn: (payload: RequestCodePayload) =>
      authApi.requestRecoveryCode(payload),
    onSuccess: () => {
      router.push("/recover/otp");
    },
  });

  const verifyRecoveryCode = useMutation({
    mutationFn: (code: string) => authApi.verifyRecoveryCode(code),
    onSuccess: () => {
      router.push("/recover/new-email");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 401) {
        router.push("/recover");
      }
    },
  });

  const requestNewPrimaryEmailCode = useMutation({
    mutationFn: (newEmail: string) =>
      authApi.requestNewPrimaryEmailCode(newEmail),
    onSuccess: () => {
      router.push("/recover/verify-new-email");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 401) {
        router.push("/recover");
      }
    },
  });

  const verifyNewPrimaryEmail = useMutation({
    mutationFn: (code: string) => authApi.verifyNewPrimaryEmail(code),
    onSuccess: () => {
      router.push("/login?recovered=1");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 401) {
        router.push("/recover");
      }
    },
  });

  const logout = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      router.push("/login");
    },
    onError: () => {
      router.push("/login");
    },
  });

  const refreshSession = useMutation({
    mutationFn: () => authApi.refresh(),
  });

  return {
    requestCode,
    verifyCode,
    resendCode,
    requestRecoveryCode,
    verifyRecoveryCode,
    requestNewPrimaryEmailCode,
    verifyNewPrimaryEmail,
    logout,
    refreshSession,
  };
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const response = await authApi.me();
      return response.data;
    },
    enabled,
    staleTime: 60_000,
  });
}

export function useInvalidateMe() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
}
