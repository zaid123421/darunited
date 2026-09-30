"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { aboutClientApi } from "@/modules/about/api/about.client.api";
import type { GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

interface UseDeleteAboutSectionOptions {
  onSuccess?: (response: GlobalResponse<null>) => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteAboutSection(options: UseDeleteAboutSectionOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: number | string) => aboutClientApi.delete(id),
    onSuccess: (response) => {
      toast.success(response.message || "About us section deleted successfully.");
      router.refresh();
      options.onSuccess?.(response);
    },
    onError: (error) => {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError("Something went wrong. Please try again.", 500);

      toast.error(
        apiError.message || "Failed to delete about us section. Please try again.",
      );
      options.onError?.(apiError);
    },
  });
}
