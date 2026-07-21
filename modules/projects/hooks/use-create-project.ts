"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { projectsClientApi } from "@/modules/projects/api/projects.client.api";

export function useCreateProject() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => projectsClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        router.push("/dashboard/projects");
      }
    },
  });
}
