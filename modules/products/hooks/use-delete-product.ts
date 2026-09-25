"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
      toast.success(response.message || "Product deleted successfully.");
      router.refresh();
      options.onSuccess?.(response);
    },
    onError: (error) => {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError("Something went wrong. Please try again.", 500);

      toast.error(apiError.message || "Failed to delete product. Please try again.");
      options.onError?.(apiError);
    },
  });
}
