"use client";

import { useCallback, useRef, useState } from "react";
import {
  classifyMediaFile,
  INVALID_IMAGE_TYPE_MESSAGE,
} from "@/modules/media/lib/media-file-validation";
import type { MediaItem } from "@/modules/media/types";
import { snapshotGallery } from "@/modules/services/lib/service-media-mappers";

export function useGalleryEdit(initial: MediaItem[] = []) {
  const [media, setMedia] = useState<MediaItem[]>(initial);
  const [baselineSnapshot, setBaselineSnapshot] = useState(() =>
    snapshotGallery(initial),
  );
  const tempKeyCounter = useRef(
    initial.reduce((max, item) => {
      if (!item.tempKey?.startsWith("new_")) {
        return max;
      }

      const value = Number(item.tempKey.replace("new_", ""));
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0) + 1,
  );

  const galleryChanged = snapshotGallery(media) !== baselineSnapshot;

  const addFiles = useCallback((files: FileList | File[]) => {
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

      const tempKey = `new_${tempKeyCounter.current++}`;

      next.push({
        url: URL.createObjectURL(file),
        kind,
        file,
        tempKey,
      });
    }

    if (next.length > 0) {
      setMedia((current) => [...current, ...next]);
    }

    return {
      hasInvalidImage,
      invalidImageMessage: hasInvalidImage ? INVALID_IMAGE_TYPE_MESSAGE : null,
    };
  }, []);

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

  const resetGallery = useCallback((next: MediaItem[]) => {
    setMedia((current) => {
      current.forEach((item) => {
        if (item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
      return next;
    });
    setBaselineSnapshot(snapshotGallery(next));
  }, []);

  return {
    media,
    galleryChanged,
    addFiles,
    removeAt,
    reorderMedia,
    resetGallery,
  };
}
