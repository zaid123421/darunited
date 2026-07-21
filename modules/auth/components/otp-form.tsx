"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { getSafeDashboardRedirect } from "@/shared/lib/safe-redirect";
import { ApiError } from "@/shared/types/global-response";

const OTP_LENGTH = 6;

export function OtpForm() {
  const searchParams = useSearchParams();
  const redirect = getSafeDashboardRedirect(searchParams.get("redirect"));
  const { verifyCode, resendCode } = useAuth({ redirect });
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const isResendRateLimited =
    resendCode.error instanceof ApiError && resendCode.error.statusCode === 429;

  const clearVerifyFeedback = () => {
    verifyCode.reset();
  };

  const clearResendFeedback = () => {
    setResendMessage(null);
    resendCode.reset();
  };

  const updateDigit = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = sanitized;
    setDigits(next);
    clearResendFeedback();
    clearVerifyFeedback();

    if (sanitized && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
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
    setDigits(next);
    clearResendFeedback();
    clearVerifyFeedback();
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== OTP_LENGTH) return;
    clearVerifyFeedback();
    verifyCode.mutate(code);
  };

  const handleResend = () => {
    clearResendFeedback();
    resendCode.mutate(undefined, {
      onSuccess: (response) => {
        setDigits(Array(OTP_LENGTH).fill(""));
        inputsRef.current[0]?.focus();

        const debugHint = response.data.debug_code
          ? ` Dev code: ${response.data.debug_code}`
          : "";

        setResendMessage(`${response.message}.${debugHint}`.trim());
      },
      onError: () => {
        setResendMessage(null);
      },
    });
  };

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
          Verification
        </p>
        <h1 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-primary sm:text-[1.85rem]">
          Enter your code
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We sent a 6-digit code to your email. It expires shortly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex justify-between gap-1.5 sm:gap-2.5">
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
              autoFocus={index === 0}
              aria-label={`Digit ${index + 1}`}
              onChange={(e) => updateDigit(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={cn(
                "h-12 w-full rounded-xl border border-border bg-input text-center text-lg font-semibold text-foreground sm:h-14 sm:text-xl",
                inputFocusRingClass,
                "ring-offset-background",
                digit && "border-primary/40",
              )}
            />
          ))}
        </div>

        {verifyCode.error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            {verifyCode.error.message}
          </div>
        ) : null}

        {resendMessage ? (
          <div className="rounded-xl border border-primary/25 bg-muted px-4 py-3 text-center text-sm text-foreground">
            {resendMessage}
          </div>
        ) : null}

        {resendCode.error ? (
          <div
            role="alert"
            className={cn(
              "rounded-xl px-4 py-3 text-center text-sm",
              isResendRateLimited
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {resendCode.error.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={verifyCode.isPending || code.length !== OTP_LENGTH}
          className="btn-brand flex h-12 w-full items-center justify-center rounded-xl text-sm font-medium transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifyCode.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              Verifying…
            </span>
          ) : (
            "Verify & continue"
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              disabled={resendCode.isPending}
              onClick={handleResend}
              className="font-medium text-primary transition-colors hover:text-foreground disabled:opacity-50"
            >
              {resendCode.isPending ? "Resending…" : "Resend code"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
