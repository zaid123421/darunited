import { X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showClear?: boolean;
  onClear?: () => void;
  clearLabel?: string;
}

export function Input({
  className,
  label,
  error,
  id,
  showClear = false,
  onClear,
  clearLabel = "Clear field",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  const canClear = showClear && Boolean(onClear);

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground/60",
            inputFocusRingClass,
            canClear && "pr-10",
            error &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive",
            className,
          )}
          {...props}
        />
        {canClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={clearLabel}
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <span>⚠</span> {error}
        </p>
      ) : null}
    </div>
  );
}
