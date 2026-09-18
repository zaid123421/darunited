"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccountStatus,
} from "@/modules/accounts/hooks/use-accounts";
import {
  createAccountSchema,
  type CreateAccountFormValues,
} from "@/modules/accounts/schemas/account.schema";
import { AccountStatusControl } from "@/modules/accounts/components/account-status-control";
import type { Account, AccountStatus } from "@/modules/accounts/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Input } from "@/shared/components/ui/input";
import { ApiError } from "@/shared/types/global-response";
import { cn } from "@/shared/lib/cn";

function formatRole(role: Account["role"]) {
  return role === "super_admin" ? "Super admin" : "Analyst";
}

export function AccountsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAccounts();
  const createAccount = useCreateAccount();
  const updateStatus = useUpdateAccountStatus();
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const createForm = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: { fullName: "", email: "" },
  });

  const accounts = data?.accounts ?? [];

  const onCreate = (values: CreateAccountFormValues) => {
    setCreateSuccess(null);
    setCreateError(null);
    createAccount.mutate(values, {
      onSuccess: (response) => {
        setCreateSuccess(
          response.message ||
            "Invitation sent. The analyst can activate from their email link.",
        );
        createForm.reset({ fullName: "", email: "" });
      },
      onError: (err) => {
        setCreateError(
          err instanceof ApiError ? err.message : "Failed to create account.",
        );
      },
    });
  };

  const onStatusChange = (userId: number, status: AccountStatus) => {
    setStatusSuccess(null);
    setStatusError(null);
    setUpdatingUserId(userId);
    updateStatus.mutate(
      { userId, status },
      {
        onSuccess: (response) => {
          setStatusSuccess(response.message || "Account status updated.");
        },
        onError: (err) => {
          setStatusError(
            err instanceof ApiError
              ? err.message
              : "Failed to update account status.",
          );
        },
        onSettled: () => {
          setUpdatingUserId(null);
        },
      },
    );
  };

  return (
    <div className="flex min-h-full w-full flex-col gap-6 pb-10">
      <div>
        <h1 className="page-title">Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite analysts and manage account status from the list below.
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <CardTitle className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">
          Invite analyst
        </CardTitle>

        {createSuccess ? (
          <div className="mb-4">
            <FeedbackBanner
              type="success"
              message={createSuccess}
              onDismiss={() => setCreateSuccess(null)}
            />
          </div>
        ) : null}

        <form
          onSubmit={createForm.handleSubmit(onCreate)}
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-foreground"
              >
                Full name
              </label>
              <Input
                id="fullName"
                placeholder="Analyst name"
                className="h-11 rounded-xl bg-input"
                error={createForm.formState.errors.fullName?.message}
                {...createForm.register("fullName")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="invite-email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <Input
                id="invite-email"
                type="email"
                placeholder="analyst@darunited.com"
                className="h-11 rounded-xl bg-input"
                error={createForm.formState.errors.email?.message}
                {...createForm.register("email")}
              />
            </div>
          </div>

          {createError ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {createError}
            </div>
          ) : null}

          <div>
            <Button
              type="submit"
              disabled={createAccount.isPending}
              className={cn(
                "h-10 rounded-lg px-5 text-sm",
                createAccount.isPending && "opacity-70",
              )}
            >
              {createAccount.isPending ? "Sending invite…" : "Send invitation"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground sm:text-base">
            All accounts
          </h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="h-9 rounded-lg px-3 text-xs"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {statusSuccess ? (
          <FeedbackBanner
            type="success"
            message={statusSuccess}
            onDismiss={() => setStatusSuccess(null)}
          />
        ) : null}

        {statusError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {statusError}
          </div>
        ) : null}

        {isLoading ? (
          <Card className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Loading accounts…</p>
          </Card>
        ) : isError ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-base font-medium text-foreground">
              Failed to load accounts
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {error instanceof ApiError
                ? error.message
                : "Something went wrong while fetching accounts."}
            </p>
            <Button
              type="button"
              onClick={() => void refetch()}
              className="h-9 rounded-lg px-4 text-sm"
            >
              Try again
            </Button>
          </Card>
        ) : accounts.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-base font-medium text-foreground">
              No accounts yet
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Invited analysts will appear here after you send an invitation.
            </p>
          </Card>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => {
                    const isUpdating =
                      updatingUserId === account.id && updateStatus.isPending;
                    const statusLocked = account.role === "super_admin";

                    return (
                      <tr
                        key={account.id}
                        className="border-t border-border text-sm"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {account.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {account.fullName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {account.email}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {formatRole(account.role)}
                        </td>
                        <td className="px-4 py-3">
                          <AccountStatusControl
                            status={account.status}
                            locked={statusLocked}
                            isUpdating={isUpdating}
                            ariaLabel={`Status for ${account.fullName}`}
                            onChange={(status) =>
                              onStatusChange(account.id, status)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {accounts.map((account) => {
                const isUpdating =
                  updatingUserId === account.id && updateStatus.isPending;
                const statusLocked = account.role === "super_admin";

                return (
                  <Card key={account.id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {account.fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {account.email}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        #{account.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        {formatRole(account.role)}
                      </p>
                      <AccountStatusControl
                        status={account.status}
                        locked={statusLocked}
                        isUpdating={isUpdating}
                        ariaLabel={`Status for ${account.fullName}`}
                        onChange={(status) =>
                          onStatusChange(account.id, status)
                        }
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
