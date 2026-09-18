"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

const OTP_LENGTH = 6;

export function RecoverOtpForm() {
  const { verifyRecoveryCode } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const isRateLimited =
    verifyRecoveryCode.error instanceof ApiError &&
    verifyRecoveryCode.error.statusCode === 429;

  const updateDigit = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = sanitized;
    setDigits(next);
    verifyRecoveryCode.reset();

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
    verifyRecoveryCode.reset();
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== OTP_LENGTH) return;
    verifyRecoveryCode.mutate(code);
  };

  return (
    <div>
      <Link
        href="/recover"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="mb-7 sm:mb-8">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Recovery verification
        </p>
        <h1 className="font-heading text-[1.65rem] font-bold leading-tight tracking-tight text-primary sm:text-[1.85rem]">
          Enter recovery code
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Enter the 6-digit code sent to your recovery email.
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

        {verifyRecoveryCode.error ? (
          <div
            role="alert"
            className={cn(
              "rounded-xl px-4 py-3 text-center text-sm",
              isRateLimited
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border border-destructive/30 bg-destructive/10 text-destructive",
            )}
          >
            {verifyRecoveryCode.error.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={verifyRecoveryCode.isPending || code.length !== OTP_LENGTH}
          className="btn-brand flex h-12 w-full items-center justify-center rounded-xl text-sm font-medium transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifyRecoveryCode.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              Verifying…
            </span>
          ) : (
            "Verify & continue"
          )}
        </button>
      </form>
    </div>
  );
}
