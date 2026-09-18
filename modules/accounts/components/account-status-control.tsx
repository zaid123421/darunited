"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import type { AccountStatus } from "@/modules/accounts/types";
import { cn } from "@/shared/lib/cn";

const STATUS_OPTIONS: {
  value: AccountStatus;
  label: string;
  hint: string;
}[] = [
  { value: "active", label: "Active", hint: "Can sign in" },
  { value: "inactive", label: "Inactive", hint: "Pending or disabled" },
  { value: "suspended", label: "Suspended", hint: "Access revoked" },
];

const MENU_WIDTH = 208;
const MENU_GAP = 8;

function statusTone(status: AccountStatus) {
  switch (status) {
    case "active":
      return {
        dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]",
        pill: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
        hover: "hover:border-emerald-400/40 hover:bg-emerald-400/15",
        optionDot: "bg-emerald-400",
      };
    case "inactive":
      return {
        dot: "bg-du-grey/80",
        pill: "border-white/10 bg-white/[0.04] text-du-grey",
        hover: "hover:border-white/20 hover:bg-white/[0.07]",
        optionDot: "bg-du-grey",
      };
    case "suspended":
      return {
        dot: "bg-du-red shadow-[0_0_8px_rgba(233,28,36,0.45)]",
        pill: "border-du-red/30 bg-du-red/10 text-[#ff8a8e]",
        hover: "hover:border-du-red/45 hover:bg-du-red/15",
        optionDot: "bg-du-red",
      };
  }
}

interface AccountStatusControlProps {
  status: AccountStatus;
  disabled?: boolean;
  locked?: boolean;
  isUpdating?: boolean;
  ariaLabel: string;
  onChange: (status: AccountStatus) => void;
}

export function AccountStatusControl({
  status,
  disabled = false,
  locked = false,
  isUpdating = false,
  ariaLabel,
  onChange,
}: AccountStatusControlProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const tone = statusTone(status);
  const current = STATUS_OPTIONS.find((option) => option.value === status);
  const interactive = !locked && !disabled && !isUpdating;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewportPadding = 12;
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const estimatedMenuHeight = 180;
      const openUpward =
        spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

      let left = rect.right - MENU_WIDTH;
      left = Math.max(
        viewportPadding,
        Math.min(left, window.innerWidth - MENU_WIDTH - viewportPadding),
      );

      setMenuStyle({
        position: "fixed",
        top: openUpward
          ? undefined
          : rect.bottom + MENU_GAP,
        bottom: openUpward
          ? window.innerHeight - rect.top + MENU_GAP
          : undefined,
        left,
        width: MENU_WIDTH,
        zIndex: 80,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (locked) {
    return (
      <span
        className={cn(
          "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium tracking-wide",
          tone.pill,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
        {current?.label ?? status}
      </span>
    );
  }

  const menu =
    open && mounted && menuStyle
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-label={ariaLabel}
            style={menuStyle}
            className={cn(
              "overflow-hidden rounded-2xl border border-border",
              "bg-card/95 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-md",
            )}
          >
            {STATUS_OPTIONS.map((option) => {
              const optionTone = statusTone(option.value);
              const isSelected = option.value === status;

              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setOpen(false);
                      if (option.value !== status) onChange(option.value);
                      triggerRef.current?.focus();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-white/[0.06]"
                        : "hover:bg-white/[0.04]",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        optionTone.optionDot,
                        option.value === "active" &&
                          "shadow-[0_0_6px_rgba(52,211,153,0.5)]",
                        option.value === "suspended" &&
                          "shadow-[0_0_6px_rgba(233,28,36,0.45)]",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {option.label}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {option.hint}
                      </span>
                    </span>
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="inline-flex">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        disabled={!interactive}
        onClick={() => interactive && setOpen((prev) => !prev)}
        className={cn(
          "inline-flex h-8 min-w-[8.75rem] items-center gap-2 rounded-full border px-3 text-xs font-medium tracking-wide transition-all",
          tone.pill,
          interactive && tone.hover,
          interactive && "cursor-pointer",
          (!interactive || isUpdating) && "cursor-wait opacity-70",
          open && "ring-2 ring-ring/25",
        )}
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin opacity-80" />
        ) : (
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)} />
        )}
        <span className="flex-1 text-left">{current?.label ?? status}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {menu}
    </div>
  );
}
