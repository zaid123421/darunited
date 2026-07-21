"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { projectsClientApi } from "@/modules/projects/api/projects.client.api";
import type { UpdateProjectInput } from "@/modules/projects/types";

interface UseUpdateProjectOptions {
  onSuccess?: () => void;
}

export function useUpdateProject(options: UseUpdateProjectOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectsClientApi.updateProject(input),
    onSuccess: () => {
      router.refresh();
      options.onSuccess?.();
    },
  });
}
