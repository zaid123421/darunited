"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { TurnstileWidget } from "@/modules/auth/components/turnstile-widget";
import { resolveTurnstileToken } from "@/shared/lib/auth/otp-debug";
import { buildBackendApiUrl, env } from "@/shared/config/env";
import { ApiError } from "@/shared/types/global-response";
import type { ApiErrorBody, GlobalResponse } from "@/shared/types/global-response";
import { cn } from "@/shared/lib/cn";

export function ActivateAccountForm() {
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token")?.trim() ?? "";
  const usesFixedTestToken = Boolean(env.TURNSTILE_TEST_TOKEN);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(
    usesFixedTestToken ? env.TURNSTILE_TEST_TOKEN : null,
  );
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit =
    Boolean(invitationToken) &&
    Boolean(resolveTurnstileToken(turnstileToken)) &&
    !isPending &&
    !successMessage;

  const handleActivate = async () => {
    const token = resolveTurnstileToken(turnstileToken);

    if (!invitationToken || !token || isPending || successMessage) {
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      // Calls Laravel: POST /api/admin/account/accept-invitation
      const response = await fetch(
        buildBackendApiUrl("/admin/account/accept-invitation"),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invitationToken,
            turnstileToken: token,
          }),
        },
      );

      const raw = await response.text();
      const data = raw
        ? (JSON.parse(raw) as GlobalResponse<null> | ApiErrorBody)
        : null;

      if (!response.ok || !data) {
        const errorBody = data as ApiErrorBody | null;
        throw new ApiError(
          errorBody?.message ?? "Unable to activate this invitation.",
          errorBody?.status_code ?? response.status,
          errorBody?.errors,
        );
      }

      setSuccessMessage(
        data.message || "Account activated. You can sign in now.",
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to activate this invitation.",
      );
    } finally {
      setIsPending(false);
    }
  };

  if (!invitationToken) {
    return (
      <div>
        <div className="mb-7 sm:mb-8">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Invitation
          </p>
          <h1 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-primary sm:text-[1.85rem]">
            Invalid invitation
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This activation link is missing a token. Ask an admin to resend the
            invitation.
          </p>
        </div>
        <Link
          href="/login"
          className="btn-brand inline-flex h-12 w-full items-center justify-center rounded-xl text-sm font-medium"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7 sm:mb-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Invitation
        </p>
        <h1 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-primary sm:text-[1.85rem]">
          Activate account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Confirm you&apos;re human to activate your DARUNITED staff account.
        </p>
      </div>

      {successMessage ? (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-primary/25 bg-muted px-4 py-3 text-sm text-foreground">
            {successMessage}
          </div>
          <Link
            href="/login"
            className="btn-brand inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium"
          >
            Continue to sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {usesFixedTestToken ? (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              Local Turnstile test token is active for invitation acceptance.
            </p>
          ) : (
            <TurnstileWidget
              action="accept_account_invitation"
              onToken={setTurnstileToken}
            />
          )}

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : null}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              void handleActivate();
            }}
            className={cn(
              "btn-brand group flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                Activating…
              </span>
            ) : (
              <>
                Activate account
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
