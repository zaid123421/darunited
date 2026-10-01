"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { subcategoriesClientApi } from "@/modules/subcategories/api/subcategories.client.api";
import { ApiError } from "@/shared/types/global-response";

interface UseCreateSubcategoryOptions {
  redirectTo?: string;
}

export function useCreateSubcategory(
  options: UseCreateSubcategoryOptions = {},
) {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => subcategoriesClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        toast.success(response.message || "Subcategory created successfully.");
        router.push(options.redirectTo ?? "/dashboard/subcategories");
        router.refresh();
      }
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to create subcategory. Please try again.");
      }
    },
  });
}
