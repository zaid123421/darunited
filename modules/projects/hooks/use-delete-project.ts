"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
      toast.success(response.message || "Project deleted successfully.");
      router.refresh();
      options.onSuccess?.(response);
    },
    onError: (error) => {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError("Something went wrong. Please try again.", 500);

      toast.error(apiError.message || "Failed to delete project. Please try again.");
      options.onError?.(apiError);
    },
  });
}
