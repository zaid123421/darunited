"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productsClientApi } from "@/modules/products/api/products.client.api";
import type { UpdateProductInput } from "@/modules/products/types";
import { ApiError } from "@/shared/types/global-response";

interface UseUpdateProductOptions {
  onSuccess?: () => void;
}

export function useUpdateProduct(options: UseUpdateProductOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProductInput) =>
      productsClientApi.updateProduct(input),
    onSuccess: () => {
      toast.success("Product updated successfully.");
      router.refresh();
      options.onSuccess?.();
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to update product. Please try again.");
      }
    },
  });
}
