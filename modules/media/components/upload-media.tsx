"use client";

import { Upload } from "lucide-react";
import type { MediaItem } from "@/modules/media/types";

interface UploadMediaProps {
  media: MediaItem[];
  mainIndex: number;
  onAddFiles: (files: FileList) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
}

export function UploadMedia({
  media,
  mainIndex,
  onAddFiles,
  onReorder,
  onRemove,
}: UploadMediaProps) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center hover:border-accent/50">
        <Upload className="mb-2 h-6 w-6 text-accent" />
        <span className="text-sm text-foreground">Browse or drag & drop media</span>
        <span className="text-xs text-muted-foreground">Images and videos supported</span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) {
              onAddFiles(event.target.files);
            }
          }}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item, index) => (
          <div
            key={`${item.url}-${index}`}
            className="relative overflow-hidden rounded-xl border border-border bg-card"
          >
            {item.kind === "video" ? (
              <video src={item.url} className="aspect-video w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt="" className="aspect-video w-full object-cover" />
            )}
            <div className="flex items-center justify-between gap-2 p-2 text-xs">
              {mainIndex === index ? (
                <span className="text-accent">Main</span>
              ) : item.kind === "image" ? (
                <button
                  type="button"
                  onClick={() => onReorder(index, mainIndex === -1 ? 0 : mainIndex)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Set as main
                </button>
              ) : (
                <span className="text-muted-foreground">Video</span>
              )}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-destructive"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
