"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productionClientApi } from "@/modules/production/api/production.client.api";
import { ApiError } from "@/shared/types/global-response";

export function useCreateProductionSection() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => productionClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        toast.success(
          response.message || "Production section created successfully.",
        );
        router.push("/dashboard/production");
        router.refresh();
      }
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to create production section. Please try again.");
      }
    },
  });
}
