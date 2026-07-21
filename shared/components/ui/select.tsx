"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { inputFocusWithinRingClass } from "@/shared/lib/input-focus";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  /** Controlled selected value */
  value?: string;
  /** Uncontrolled initial value — used with `name` for native form submission */
  defaultValue?: string;
  /** Called with the newly selected value string */
  onValueChange?: (value: string) => void;
  name?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  name,
  id,
  className,
  disabled,
}: SelectProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedValue = isControlled ? controlledValue : internalValue;
  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const selectId = id ?? name;

  const handleSelect = (value: string) => {
    if (!isControlled) {
      setInternalValue(value);
    }
    onValueChange?.(value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((prev) => !prev);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!open) return;

    const currentIndex = options.findIndex((opt) => opt.value === selectedValue);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = options[currentIndex + 1] ?? options[0];
      if (next) handleSelect(next.value);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = options[currentIndex - 1] ?? options[options.length - 1];
      if (prev) handleSelect(prev.value);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}

      <div className="relative" ref={containerRef}>
        {name ? (
          <input type="hidden" name={name} value={selectedValue} />
        ) : null}

        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={selectId ? `${selectId}-listbox` : undefined}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-xl border border-border bg-input px-4 text-sm",
            "text-left",
            inputFocusWithinRingClass,
            error &&
              "border-destructive focus-within:border-destructive focus-within:ring-destructive",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <span
            className={cn(
              "truncate",
              !selectedOption && "text-muted-foreground/60",
            )}
          >
            {selectedOption?.label ?? placeholder ?? "Select…"}
          </span>
          <ChevronDown
            className={cn(
              "ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        {open ? (
          <ul
            ref={listRef}
            id={selectId ? `${selectId}-listbox` : undefined}
            role="listbox"
            aria-label={label}
            className={cn(
              "absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-xl",
              "animate-in fade-in-0 zoom-in-95 duration-150",
            )}
          >
            <div className="app-scrollbar max-h-64 overflow-y-auto py-1">
              {placeholder ? (
                <li
                  role="option"
                  aria-selected={selectedValue === ""}
                  onClick={() => handleSelect("")}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors",
                    "text-muted-foreground hover:bg-muted",
                    selectedValue === "" && "bg-muted/50",
                  )}
                >
                  {placeholder}
                </li>
              ) : null}

              {options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    ) : null}
                  </li>
                );
              })}
            </div>
          </ul>
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
