"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productsClientApi } from "@/modules/products/api/products.client.api";
import { ApiError } from "@/shared/types/global-response";

export function useCreateProduct() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => productsClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        toast.success(response.message || "Product created successfully.");
        router.push("/dashboard/products");
        router.refresh();
      }
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to create product. Please try again.");
      }
    },
  });
}
