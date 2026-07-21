"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { aboutClientApi } from "@/modules/about/api/about.client.api";
import type { AboutUsSyncPayload } from "@/modules/about/types";

interface UseSaveAboutUsOptions {
  onSuccess?: (message: string) => void;
}

export function useSaveAboutUs(options: UseSaveAboutUsOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (body: AboutUsSyncPayload) => aboutClientApi.sync(body),
    onSuccess: (response) => {
      router.refresh();
      options.onSuccess?.(response.message);
    },
  });
}
