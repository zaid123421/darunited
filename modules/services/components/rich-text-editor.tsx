"use client";

import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib/cn";
import { inputFocusWithinRingClass } from "@/shared/lib/input-focus";

type RichTextEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  error?: string;
};

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Describe the service details here...",
  id,
  error,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const exec = (command: string) => {
    document.execCommand(command, false);
    onChange?.(editorRef.current?.innerHTML ?? "");
  };

  const handleInput = () => {
    onChange?.(editorRef.current?.innerHTML ?? "");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-input",
          inputFocusWithinRingClass,
          error ? "border-destructive" : "border-border",
        )}
      >
        <div className="flex items-center gap-1 border-b border-border px-3 py-2">
          <ToolbarButton
            label="Bold"
            onClick={() => exec("bold")}
            icon={<Bold className="h-4 w-4" />}
          />
          <ToolbarButton
            label="Italic"
            onClick={() => exec("italic")}
            icon={<Italic className="h-4 w-4" />}
          />
          <ToolbarButton
            label="Underline"
            onClick={() => exec("underline")}
            icon={<Underline className="h-4 w-4" />}
          />
          <span className="mx-1 h-5 w-px bg-border" />
          <ToolbarButton
            label="Bullet list"
            onClick={() => exec("insertUnorderedList")}
            icon={<List className="h-4 w-4" />}
          />
          <ToolbarButton
            label="Numbered list"
            onClick={() => exec("insertOrderedList")}
            icon={<ListOrdered className="h-4 w-4" />}
          />
        </div>

        <div
          ref={editorRef}
          id={id}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          data-placeholder={placeholder}
          onInput={handleInput}
          className={cn(
            "min-h-[180px] px-4 py-3 text-sm leading-relaxed text-foreground outline-none",
            "empty:before:pointer-events-none empty:before:text-muted-foreground/60 empty:before:content-[attr(data-placeholder)]",
          )}
        />
      </div>
      {error ? (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <span>⚠</span> {error}
        </p>
      ) : null}
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {icon}
    </button>
  );
}
