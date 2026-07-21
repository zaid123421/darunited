"use client";

import { useCallback, useState } from "react";
import {
  classifyMediaFile,
  INVALID_IMAGE_TYPE_MESSAGE,
} from "@/modules/media/lib/media-file-validation";
import type { MediaItem } from "@/modules/media/types";

type UseMediaUploadOptions = {
  onValidationError?: (message: string) => void;
};

export function useMediaUpload(
  initial: MediaItem[] = [],
  options: UseMediaUploadOptions = {},
) {
  const [media, setMedia] = useState<MediaItem[]>(initial);
  const { onValidationError } = options;

  const mainIndex = media.findIndex((item) => item.kind === "image");

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const next: MediaItem[] = [];
      let hasInvalidImage = false;

      for (const file of Array.from(files)) {
        const kind = classifyMediaFile(file);

        if (!kind) {
          if (!file.type.startsWith("video/")) {
            hasInvalidImage = true;
          }
          continue;
        }

        next.push({
          url: URL.createObjectURL(file),
          kind,
          file,
        });
      }

      if (hasInvalidImage) {
        onValidationError?.(INVALID_IMAGE_TYPE_MESSAGE);
      }

      if (next.length > 0) {
        setMedia((current) => [...current, ...next]);
      }
    },
    [onValidationError],
  );

  const removeAt = useCallback((index: number) => {
    setMedia((current) => {
      const item = current[index];
      if (item?.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      return current.filter((_, i) => i !== index);
    });
  }, []);

  const reorderMedia = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }

    setMedia((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) {
        return current;
      }
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  return {
    media,
    mainIndex,
    addFiles,
    removeAt,
    reorderMedia,
    setMedia,
  };
}
