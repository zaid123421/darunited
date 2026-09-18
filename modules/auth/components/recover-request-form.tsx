"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChevronLeft, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { TurnstileWidget } from "@/modules/auth/components/turnstile-widget";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/modules/auth/schemas/login.schema";
import { resolveTurnstileToken } from "@/shared/lib/auth/otp-debug";
import { env } from "@/shared/config/env";
import { ApiError } from "@/shared/types/global-response";
import { cn } from "@/shared/lib/cn";

export function RecoverRequestForm() {
  const { requestRecoveryCode } = useAuth();
  const usesFixedTestToken = Boolean(env.TURNSTILE_TEST_TOKEN);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(
    usesFixedTestToken ? env.TURNSTILE_TEST_TOKEN : null,
  );
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: LoginFormValues) => {
    const token = resolveTurnstileToken(turnstileToken);
    if (!token) {
      return;
    }

    requestRecoveryCode.reset();
    requestRecoveryCode.mutate({
      email: values.email,
      turnstileToken: token,
      companyWebsite: null,
    });
  };

  const isRateLimited =
    requestRecoveryCode.error instanceof ApiError &&
    requestRecoveryCode.error.statusCode === 429;
  const email = watch("email");
  const canSubmit =
    Boolean(resolveTurnstileToken(turnstileToken)) &&
    !requestRecoveryCode.isPending;

  return (
    <div>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to sign in
      </Link>

      <div className="mb-7 sm:mb-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Account recovery
        </p>
        <h1 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-primary sm:text-[1.85rem]">
          Recover access
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Enter your primary work email. If recovery is configured, we&apos;ll
          send a code to your recovery email.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        autoComplete="on"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recovery-email" className="text-sm font-medium text-foreground">
            Primary email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-[0.875rem] z-10 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="recovery-email"
              type="email"
              inputMode="email"
              placeholder="you@darunited.com"
              autoComplete="username"
              autoFocus
              spellCheck={false}
              showClear={Boolean(email?.trim())}
              onClear={() => {
                setValue("email", "", { shouldValidate: true });
              }}
              clearLabel="Clear email"
              error={errors.email?.message}
              className="rounded-xl border border-border bg-input pl-10 text-sm ring-offset-background"
              {...register("email")}
            />
          </div>
        </div>

        <input
          type="text"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          defaultValue=""
        />

        {usesFixedTestToken ? (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Local Turnstile test token is active for recovery requests.
          </p>
        ) : (
          <TurnstileWidget
            action="account_recovery"
            onToken={setTurnstileToken}
          />
        )}

        {requestRecoveryCode.error ? (
          <div
            role="alert"
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              isRateLimited
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {requestRecoveryCode.error.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-brand group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {requestRecoveryCode.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              Sending code…
            </span>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
