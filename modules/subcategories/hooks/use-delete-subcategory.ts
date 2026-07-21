"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { subcategoriesClientApi } from "@/modules/subcategories/api/subcategories.client.api";
import type { GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

interface UseDeleteSubcategoryOptions {
  onSuccess?: (response: GlobalResponse<null>) => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteSubcategory(options: UseDeleteSubcategoryOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: number | string) => subcategoriesClientApi.delete(id),
    onSuccess: (response) => {
      router.refresh();
      options.onSuccess?.(response);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        options.onError?.(error);
        return;
      }

      options.onError?.(
        new ApiError("Something went wrong. Please try again.", 500),
      );
    },
  });
}
