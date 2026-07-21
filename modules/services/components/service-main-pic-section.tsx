"use client";

import { Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_IMAGE_TYPES_LABEL,
} from "@/modules/media/lib/media-file-validation";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/cn";

interface ServiceMainPicSectionProps {
  previewUrl: string | null;
  onSelectFile: (file: File) => void;
  onRemove: () => void;
  error?: string;
}

export function ServiceMainPicSection({
  previewUrl,
  onSelectFile,
  onRemove,
  error,
}: ServiceMainPicSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleValidatedFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    onSelectFile(file);
  };

  return (
    <Card className="p-4 sm:p-6">
      <CardTitle className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">
        Main Thumbnail
      </CardTitle>

      {previewUrl ? (
        <div className="group relative aspect-video w-full max-w-xl overflow-hidden rounded-xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Service main thumbnail"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn-brand-outline inline-flex h-10 items-center gap-2 rounded-lg border-white/20 bg-black/50 px-4 text-sm text-white backdrop-blur-sm hover:border-primary hover:text-primary"
            >
              <Upload className="h-4 w-4" />
              Replace
            </button>
            <button
              type="button"
              aria-label="Remove main thumbnail"
              onClick={onRemove}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-destructive/90 text-white backdrop-blur-sm transition-transform hover:scale-105"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleValidatedFile(event.dataTransfer.files[0]);
          }}
          className={cn(
            "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed !border-current bg-accent/5 p-6 text-center text-accent transition-all hover:bg-accent/10 sm:rounded-2xl sm:p-8",
            isDragging && "bg-accent/10",
          )}
        >
          <Upload className="mb-3 h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
          <p className="text-xs font-semibold text-foreground sm:text-sm">
            Click or drag a main thumbnail
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
            {ALLOWED_IMAGE_TYPES_LABEL} only
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_IMAGE_ACCEPT}
            className="hidden"
            onChange={(event) => handleValidatedFile(event.target.files?.[0])}
          />
        </label>
      )}

      {previewUrl ? (
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_ACCEPT}
          className="hidden"
          onChange={(event) => handleValidatedFile(event.target.files?.[0])}
        />
      ) : null}

      {error ? (
        <p className="mt-3 flex items-center gap-1 text-xs text-destructive sm:text-sm">
          <span>⚠</span> {error}
        </p>
      ) : null}

      <p className="mt-3 text-xs leading-relaxed sm:mt-4 sm:text-sm">
        <span className="font-semibold text-primary">Tip:</span>{" "}
        <span className="italic text-muted-foreground">
          This image appears as the service card thumbnail across the dashboard.
        </span>
      </p>
    </Card>
  );
}
