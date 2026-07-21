"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { subcategoriesClientApi } from "@/modules/subcategories/api/subcategories.client.api";

export function useCreateSubcategory() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => subcategoriesClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        router.push("/dashboard/subcategories");
      }
    },
  });
}
