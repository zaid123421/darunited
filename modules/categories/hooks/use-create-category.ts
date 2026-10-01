"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { categoriesClientApi } from "@/modules/categories/api/categories.client.api";
import { ApiError } from "@/shared/types/global-response";

export function useCreateCategory() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => categoriesClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        toast.success(response.message || "Category created successfully.");
        router.push("/dashboard/categories");
        router.refresh();
      }
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to create category. Please try again.");
      }
    },
  });
}
