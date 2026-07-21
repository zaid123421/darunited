"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/modules/auth/api/auth.api";
import { resolvePostLoginPath } from "@/shared/lib/auth/user";
import { ApiError } from "@/shared/types/global-response";

type UseAuthOptions = {
  redirect?: string | null;
};

function buildAuthUrl(path: "/otp" | "/login", redirect?: string | null): string {
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
    mutationFn: (email: string) => authApi.requestCode(email),
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
    logout,
    refreshSession,
  };
}
