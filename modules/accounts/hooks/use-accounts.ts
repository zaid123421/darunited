"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountsClientApi } from "@/modules/accounts/api/accounts.client.api";
import type {
  CreateAccountInput,
  UpdateAccountStatusInput,
} from "@/modules/accounts/types";

export const accountQueryKeys = {
  all: ["accounts"] as const,
  list: () => [...accountQueryKeys.all, "list"] as const,
};

export function useAccounts() {
  return useQuery({
    queryKey: accountQueryKeys.list(),
    queryFn: async () => {
      const response = await accountsClientApi.list();
      return response.data;
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAccountInput) => accountsClientApi.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.all });
    },
  });
}

export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAccountStatusInput) =>
      accountsClientApi.updateStatus(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.all });
    },
  });
}

export function useRequestRecoveryEmailAuthorization() {
  return useMutation({
    mutationFn: () => accountsClientApi.requestRecoveryEmailAuthorization(),
  });
}

export function useVerifyRecoveryEmailAuthorization() {
  return useMutation({
    mutationFn: (input: { code: string; recoveryEmail: string }) =>
      accountsClientApi.verifyRecoveryEmailAuthorization(input),
  });
}

export function useVerifyRecoveryEmail() {
  return useMutation({
    mutationFn: (code: string) => accountsClientApi.verifyRecoveryEmail(code),
  });
}
