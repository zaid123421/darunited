import { clientFetch } from "@/shared/lib/api/client";
import type {
  AccountListData,
  CreateAccountInput,
  UpdateAccountStatusInput,
} from "@/modules/accounts/types";
import type { RecoveryEmailSetupOtpData } from "@/modules/auth/types";

export const accountsClientApi = {
  list: () => clientFetch<AccountListData>("/api/admin/accounts"),

  create: (input: CreateAccountInput) =>
    clientFetch<null>("/api/admin/accounts", {
      method: "POST",
      body: JSON.stringify({
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        role: "analyst",
      }),
    }),

  updateStatus: (input: UpdateAccountStatusInput) =>
    clientFetch<null>(`/api/admin/accounts/${input.userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: input.status,
      }),
    }),

  requestRecoveryEmailAuthorization: () =>
    clientFetch<RecoveryEmailSetupOtpData>(
      "/api/admin/account/recovery-email/request-authorization-code",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    ),

  verifyRecoveryEmailAuthorization: (input: {
    code: string;
    recoveryEmail: string;
  }) =>
    clientFetch<RecoveryEmailSetupOtpData>(
      "/api/admin/account/recovery-email/verify-authorization-code",
      {
        method: "POST",
        body: JSON.stringify({
          code: input.code,
          recoveryEmail: input.recoveryEmail.trim().toLowerCase(),
        }),
      },
    ),

  verifyRecoveryEmail: (code: string) =>
    clientFetch<RecoveryEmailSetupOtpData>(
      "/api/admin/account/recovery-email/verify-code",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
    ),
};
