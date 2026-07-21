"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/modules/auth/schemas/login.schema";
import {
  getLastLoginEmail,
  setLastLoginEmail,
} from "@/shared/lib/auth/last-login-email";
import { getSafeDashboardRedirect } from "@/shared/lib/safe-redirect";
import { ApiError } from "@/shared/types/global-response";
import { cn } from "@/shared/lib/cn";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = getSafeDashboardRedirect(searchParams.get("redirect"));
  const { requestCode } = useAuth({ redirect });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    const savedEmail = getLastLoginEmail();
    if (savedEmail) {
      reset({ email: savedEmail });
    }
  }, [reset]);

  const onSubmit = (values: LoginFormValues) => {
    setLastLoginEmail(values.email);
    requestCode.reset();
    requestCode.mutate(values.email);
  };

  const isRateLimited =
    requestCode.error instanceof ApiError && requestCode.error.statusCode === 429;
  const email = watch("email");

  return (
    <div>
      <div className="mb-7 sm:mb-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Welcome back
        </p>
        <h1 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-primary sm:text-[1.85rem]">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Enter your work email and we&apos;ll send a one-time verification code.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        autoComplete="on"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-[0.875rem] z-10 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="email"
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

        {requestCode.error ? (
          <div
            role="alert"
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              isRateLimited
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {requestCode.error.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={requestCode.isPending}
          className="btn-brand group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {requestCode.isPending ? (
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

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground/70">
        Access is limited to authorized DARUNITED staff.
      </p>
    </div>
  );
}
