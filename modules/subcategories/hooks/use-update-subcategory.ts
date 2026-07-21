"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { subcategoriesClientApi } from "@/modules/subcategories/api/subcategories.client.api";
import type { UpdateSubcategoryInput } from "@/modules/subcategories/types";

interface UseUpdateSubcategoryOptions {
  onSuccess?: () => void;
}

export function useUpdateSubcategory(options: UseUpdateSubcategoryOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateSubcategoryInput) => subcategoriesClientApi.updateSubcategory(input),
    onSuccess: () => {
      router.refresh();
      options.onSuccess?.();
    },
  });
}
