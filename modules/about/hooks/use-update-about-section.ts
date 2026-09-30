"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { aboutClientApi } from "@/modules/about/api/about.client.api";
import type { UpdateAboutUsSectionInput } from "@/modules/about/types";
import { ApiError } from "@/shared/types/global-response";

interface UseUpdateAboutSectionOptions {
  onSuccess?: () => void;
}

export function useUpdateAboutSection(options: UseUpdateAboutSectionOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateAboutUsSectionInput) =>
      aboutClientApi.updateSection(input),
    onSuccess: () => {
      toast.success("About us section updated successfully.");
      router.refresh();
      options.onSuccess?.();
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to update about us section. Please try again.");
      }
    },
  });
}
