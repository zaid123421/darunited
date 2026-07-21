"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { productsClientApi } from "@/modules/products/api/products.client.api";
import type { GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

interface UseDeleteProductOptions {
  onSuccess?: (response: GlobalResponse<null>) => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteProduct(options: UseDeleteProductOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: number | string) => productsClientApi.delete(id),
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
