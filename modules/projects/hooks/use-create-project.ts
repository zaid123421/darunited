"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { projectsClientApi } from "@/modules/projects/api/projects.client.api";
import { ApiError } from "@/shared/types/global-response";

export function useCreateProject() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => projectsClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        toast.success(response.message || "Project created successfully.");
        router.push("/dashboard/projects");
        router.refresh();
      }
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to create project. Please try again.");
      }
    },
  });
}
