"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ChevronLeft, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/modules/auth/schemas/login.schema";
import { ApiError } from "@/shared/types/global-response";
import { cn } from "@/shared/lib/cn";

export function RecoverNewEmailForm() {
  const { requestNewPrimaryEmailCode } = useAuth();
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
    requestNewPrimaryEmailCode.reset();
    requestNewPrimaryEmailCode.mutate(values.email);
  };

  const email = watch("email");
  const isRateLimited =
    requestNewPrimaryEmailCode.error instanceof ApiError &&
    requestNewPrimaryEmailCode.error.statusCode === 429;

  return (
    <div>
      <Link
        href="/recover"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Restart recovery
      </Link>

      <div className="mb-7 sm:mb-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          New primary email
        </p>
        <h1 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-primary sm:text-[1.85rem]">
          Choose a new email
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We&apos;ll send a verification code to this address to set it as your
          new primary login email.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-primary-email" className="text-sm font-medium text-foreground">
            New primary email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-[0.875rem] z-10 h-4 w-4 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="new-primary-email"
              type="email"
              inputMode="email"
              placeholder="new@darunited.com"
              autoComplete="email"
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

        {requestNewPrimaryEmailCode.error ? (
          <div
            role="alert"
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              isRateLimited
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {requestNewPrimaryEmailCode.error.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={requestNewPrimaryEmailCode.isPending}
          className="btn-brand group mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {requestNewPrimaryEmailCode.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              Sending code…
            </span>
          ) : (
            <>
              Send verification code
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
