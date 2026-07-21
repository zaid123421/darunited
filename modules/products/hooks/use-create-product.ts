"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { productsClientApi } from "@/modules/products/api/products.client.api";

export function useCreateProduct() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => productsClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        router.push("/dashboard/products");
      }
    },
  });
}
