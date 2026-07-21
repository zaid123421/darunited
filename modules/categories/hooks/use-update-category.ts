"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { categoriesClientApi } from "@/modules/categories/api/categories.client.api";
import type { UpdateCategoryInput } from "@/modules/categories/types";

interface UseUpdateCategoryOptions {
  onSuccess?: () => void;
}

export function useUpdateCategory(options: UseUpdateCategoryOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => categoriesClientApi.updateCategory(input),
    onSuccess: () => {
      router.refresh();
      options.onSuccess?.();
    },
  });
}
