"use client";

import { Trash2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { MediaItem } from "@/modules/media/types";
import {
  ALLOWED_IMAGE_TYPES_LABEL,
  SERVICE_MEDIA_ACCEPT,
} from "@/modules/media/lib/media-file-validation";
import { Card, CardTitle } from "@/shared/components/ui/card";

type EntityMediaSectionProps = {
  media: MediaItem[];
  mainIndex: number;
  onAddFiles: (files: FileList) => void;
  onRemoveAt: (index: number) => void;
  onReorderMedia: (fromIndex: number, toIndex: number) => void;
  canRemoveItem?: (item: MediaItem) => boolean;
  error?: string;
  showMainBadge?: boolean;
  tipText?: string;
  title?: string;
};

export function EntityMediaSection({
  media,
  mainIndex,
  onAddFiles,
  onRemoveAt,
  onReorderMedia,
  canRemoveItem = () => true,
  error,
  showMainBadge = true,
  tipText = "Drag to reorder. Numbers show the display order. The first image is always the main thumbnail â€” videos cannot be used as the main image.",
  title = "Media",
}: EntityMediaSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (files?.length) {
      onAddFiles(files);
    }
  };

  const handleReorderDrop = (toIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onReorderMedia(draggedIndex, toIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Card className="p-4 sm:p-6">
      <CardTitle className="mb-4 text-sm font-semibold sm:mb-5 sm:text-base">
        {title}
      </CardTitle>

      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "group mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed !border-current bg-accent/5 p-6 text-center text-accent transition-all hover:bg-accent/10 sm:mb-6 sm:rounded-2xl sm:p-8 lg:p-10",
          isDragging && "bg-accent/10",
        )}
      >
        <div className="mb-3 flex items-center gap-3 transition-transform duration-300 ease-out group-hover:scale-110 sm:mb-4 sm:gap-4">
          <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
          <Video className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <p className="text-xs font-semibold text-foreground sm:text-sm">
          Click or drag photos and videos
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground sm:mt-1.5 sm:text-xs">
          {ALLOWED_IMAGE_TYPES_LABEL} for images â€” MP4, MOV for videos
        </p>
        <input
          type="file"
          accept={SERVICE_MEDIA_ACCEPT}
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>

      {media.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2 lg:gap-5">
          {media.map((item, index) => (
            <div
              key={item.id ?? item.tempKey ?? item.url}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverIndex(index);
              }}
              onDragLeave={() => {
                setDragOverIndex((current) => (current === index ? null : current));
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleReorderDrop(index);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              className={cn(
                "group relative aspect-video w-full cursor-grab overflow-hidden rounded-lg border bg-muted transition-all active:cursor-grabbing sm:rounded-xl",
                dragOverIndex === index && draggedIndex !== index
                  ? "scale-[1.02] border-accent ring-2 ring-accent/30"
                  : "border-border",
                draggedIndex === index && "opacity-50",
              )}
            >
              {item.kind === "video" ? (
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                  muted
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}

              <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/50" />

              {showMainBadge && mainIndex === index ? (
                <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-full border border-primary bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
                  Main
                </span>
              ) : null}

              <span className="pointer-events-none absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-[11px] font-bold text-white sm:left-3 sm:top-3 sm:h-7 sm:w-7 sm:text-xs">
                {index + 1}
              </span>

              {item.kind === "video" ? (
                <span className="pointer-events-none absolute bottom-2 right-2 z-10 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white sm:bottom-3 sm:right-3 sm:text-[10px]">
                  Video
                </span>
              ) : null}

              <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {canRemoveItem(item) ? (
                  <button
                    type="button"
                    aria-label="Remove media"
                    onClick={() => onRemoveAt(index)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-primary bg-black/70 text-primary shadow-lg transition-transform hover:scale-105 sm:h-10 sm:w-10"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 flex items-center gap-1 text-xs text-destructive sm:text-sm">
          <span>âڑ </span> {error}
        </p>
      ) : null}

      <p className="mt-3 text-xs leading-relaxed sm:mt-4 sm:text-sm">
        <span className="font-semibold text-primary">Tip:</span>{" "}
        <span className="italic text-muted-foreground">
          {tipText}
        </span>
      </p>
    </Card>
  );
}
