"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { categoriesClientApi } from "@/modules/categories/api/categories.client.api";

export function useCreateCategory() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => categoriesClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        router.push("/dashboard/categories");
      }
    },
  });
}
