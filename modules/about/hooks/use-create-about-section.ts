"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { aboutClientApi } from "@/modules/about/api/about.client.api";
import { ApiError } from "@/shared/types/global-response";

export function useCreateAboutSection() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => aboutClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        toast.success(response.message || "About us section created successfully.");
        router.push("/dashboard/about");
        router.refresh();
      }
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to create about us section. Please try again.");
      }
    },
  });
}
