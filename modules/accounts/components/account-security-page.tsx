"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useRequestRecoveryEmailAuthorization,
  useVerifyRecoveryEmail,
  useVerifyRecoveryEmailAuthorization,
} from "@/modules/accounts/hooks/use-accounts";
import {
  recoveryEmailSchema,
  type RecoveryEmailFormValues,
} from "@/modules/accounts/schemas/account.schema";
import { useInvalidateMe, useMe } from "@/modules/auth/hooks/use-auth";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

const OTP_LENGTH = 6;

type Step = "start" | "authorize" | "verify-recovery";

function OtpInputs({
  digits,
  onChange,
  disabled,
}: {
  digits: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const updateDigit = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = sanitized;
    onChange(next);

    if (sanitized && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-1.5 sm:max-w-md sm:gap-2.5">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => updateDigit(index, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[index] && index > 0) {
              inputsRef.current[index - 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, OTP_LENGTH);
            if (!pasted) return;
            const next = Array(OTP_LENGTH).fill("");
            pasted.split("").forEach((char, i) => {
              next[i] = char;
            });
            onChange(next);
            inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
          }}
          className={cn(
            "h-12 w-full rounded-xl border border-border bg-input text-center text-lg font-semibold text-foreground",
            inputFocusRingClass,
            digit && "border-primary/40",
          )}
        />
      ))}
    </div>
  );
}

export function AccountSecurityPage() {
  const { data: me, isLoading, isError, error } = useMe(true);
  const invalidateMe = useInvalidateMe();
  const requestAuth = useRequestRecoveryEmailAuthorization();
  const verifyAuth = useVerifyRecoveryEmailAuthorization();
  const verifyRecovery = useVerifyRecoveryEmail();

  const [step, setStep] = useState<Step>("start");
  const [authDigits, setAuthDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );
  const [recoveryDigits, setRecoveryDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugHint, setDebugHint] = useState<string | null>(null);

  const emailForm = useForm<RecoveryEmailFormValues>({
    resolver: zodResolver(recoveryEmailSchema),
    defaultValues: { recoveryEmail: "" },
  });

  const configured = Boolean(me?.recoveryEmailConfigured);
  const authCode = useMemo(() => authDigits.join(""), [authDigits]);
  const recoveryCode = useMemo(() => recoveryDigits.join(""), [recoveryDigits]);

  const clearFeedback = () => {
    setMessage(null);
    setErrorMessage(null);
  };

  const startSetup = () => {
    clearFeedback();
    setDebugHint(null);
    requestAuth.mutate(undefined, {
      onSuccess: (response) => {
        setStep("authorize");
        setMessage(response.message || "Authorization code sent to your primary email.");
        if (response.data?.debug_code) {
          setDebugHint(`Dev code: ${response.data.debug_code}`);
        }
      },
      onError: (err) => {
        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "Failed to start recovery email setup.",
        );
      },
    });
  };

  const submitAuthorization = emailForm.handleSubmit((values) => {
    clearFeedback();
    if (authCode.length !== OTP_LENGTH) {
      setErrorMessage("Enter the 6-digit authorization code.");
      return;
    }

    verifyAuth.mutate(
      { code: authCode, recoveryEmail: values.recoveryEmail },
      {
        onSuccess: (response) => {
          setStep("verify-recovery");
          setMessage(
            response.message ||
              "Verification code sent to your recovery email.",
          );
          setDebugHint(
            response.data?.debug_code
              ? `Dev code: ${response.data.debug_code}`
              : null,
          );
          setRecoveryDigits(Array(OTP_LENGTH).fill(""));
        },
        onError: (err) => {
          setErrorMessage(
            err instanceof ApiError
              ? err.message
              : "Failed to verify authorization code.",
          );
        },
      },
    );
  });

  const submitRecoveryCode = () => {
    clearFeedback();
    if (recoveryCode.length !== OTP_LENGTH) {
      setErrorMessage("Enter the 6-digit recovery email code.");
      return;
    }

    verifyRecovery.mutate(recoveryCode, {
      onSuccess: (response) => {
        setMessage(response.message || "Recovery email verified.");
        setStep("start");
        setAuthDigits(Array(OTP_LENGTH).fill(""));
        setRecoveryDigits(Array(OTP_LENGTH).fill(""));
        emailForm.reset({ recoveryEmail: "" });
        invalidateMe();
      },
      onError: (err) => {
        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "Failed to verify recovery email.",
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-4 sm:p-6">
        <p className="text-sm text-destructive">
          {error instanceof ApiError
            ? error.message
            : "Unable to load account profile."}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex min-h-full w-full flex-col gap-6 pb-10">
      <div>
        <h1 className="page-title">Account security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage recovery email for primary-email account recovery.
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <CardTitle className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">
          Profile
        </CardTitle>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Name
            </dt>
            <dd className="mt-1 text-sm text-foreground">{me?.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Email
            </dt>
            <dd className="mt-1 text-sm text-foreground">{me?.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Role
            </dt>
            <dd className="mt-1 text-sm text-foreground">{me?.role}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Recovery email
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {configured ? "Configured" : "Not configured"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="p-4 sm:p-6">
        <CardTitle className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">
          {configured ? "Update recovery email" : "Set recovery email"}
        </CardTitle>

        {message ? (
          <div className="mb-4">
            <FeedbackBanner
              type="success"
              message={message}
              onDismiss={() => setMessage(null)}
            />
          </div>
        ) : null}

        {debugHint ? (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {debugHint}
          </p>
        ) : null}

        {errorMessage ? (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {errorMessage}
          </div>
        ) : null}

        {step === "start" ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              We&apos;ll send an authorization code to your primary email, then
              a verification code to the recovery email you choose.
            </p>
            <Button
              type="button"
              onClick={startSetup}
              disabled={requestAuth.isPending}
              className="h-10 w-fit rounded-lg px-5 text-sm"
            >
              {requestAuth.isPending ? "Sending…" : "Start setup"}
            </Button>
          </div>
        ) : null}

        {step === "authorize" ? (
          <form onSubmit={submitAuthorization} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Authorization code (primary email)
              </label>
              <OtpInputs digits={authDigits} onChange={setAuthDigits} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="recoveryEmail"
                className="text-sm font-medium text-foreground"
              >
                Recovery email
              </label>
              <Input
                id="recoveryEmail"
                type="email"
                placeholder="recovery@example.com"
                className="h-11 rounded-xl bg-input"
                error={emailForm.formState.errors.recoveryEmail?.message}
                {...emailForm.register("recoveryEmail")}
              />
            </div>

            <Button
              type="submit"
              disabled={verifyAuth.isPending}
              className="h-10 w-fit rounded-lg px-5 text-sm"
            >
              {verifyAuth.isPending
                ? "Verifying…"
                : "Verify & send recovery code"}
            </Button>
          </form>
        ) : null}

        {step === "verify-recovery" ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Recovery email code
              </label>
              <OtpInputs
                digits={recoveryDigits}
                onChange={setRecoveryDigits}
              />
            </div>
            <Button
              type="button"
              onClick={submitRecoveryCode}
              disabled={verifyRecovery.isPending}
              className="h-10 w-fit rounded-lg px-5 text-sm"
            >
              {verifyRecovery.isPending
                ? "Confirming…"
                : "Confirm recovery email"}
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
