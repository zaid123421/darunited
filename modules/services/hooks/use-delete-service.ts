"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { servicesClientApi } from "@/modules/services/api/services.client.api";
import type { GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

interface UseDeleteServiceOptions {
  onSuccess?: (response: GlobalResponse<null>) => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteService(options: UseDeleteServiceOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: number | string) => servicesClientApi.delete(id),
    onSuccess: (response) => {
      router.refresh();
      options.onSuccess?.(response);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        options.onError?.(error);
        return;
      }

      options.onError?.(
        new ApiError("Something went wrong. Please try again.", 500),
      );
    },
  });
}
