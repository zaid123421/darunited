"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { projectsClientApi } from "@/modules/projects/api/projects.client.api";
import type { GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

interface UseDeleteProjectOptions {
  onSuccess?: (response: GlobalResponse<null>) => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteProject(options: UseDeleteProjectOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: number | string) => projectsClientApi.delete(id),
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
