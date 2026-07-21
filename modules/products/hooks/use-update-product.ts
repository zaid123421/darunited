"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { productsClientApi } from "@/modules/products/api/products.client.api";
import type { UpdateProductInput } from "@/modules/products/types";

interface UseUpdateProductOptions {
  onSuccess?: () => void;
}

export function useUpdateProduct(options: UseUpdateProductOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProductInput) => productsClientApi.updateProduct(input),
    onSuccess: () => {
      router.refresh();
      options.onSuccess?.();
    },
  });
}
