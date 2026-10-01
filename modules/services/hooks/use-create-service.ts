"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { servicesClientApi } from "@/modules/services/api/services.client.api";
import { ApiError } from "@/shared/types/global-response";

export function useCreateService() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => servicesClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        toast.success(response.message || "Service created successfully.");
        router.push("/dashboard/services");
        router.refresh();
      }
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to create service. Please try again.");
      }
    },
  });
}
