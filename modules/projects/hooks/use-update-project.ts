"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { projectsClientApi } from "@/modules/projects/api/projects.client.api";
import type { UpdateProjectInput } from "@/modules/projects/types";
import { ApiError } from "@/shared/types/global-response";

interface UseUpdateProjectOptions {
  onSuccess?: () => void;
}

export function useUpdateProject(options: UseUpdateProjectOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProjectInput) =>
      projectsClientApi.updateProject(input),
    onSuccess: () => {
      toast.success("Project updated successfully.");
      router.refresh();
      options.onSuccess?.();
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to update project. Please try again.");
      }
    },
  });
}
