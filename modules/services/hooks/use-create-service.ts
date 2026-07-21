"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { servicesClientApi } from "@/modules/services/api/services.client.api";

export function useCreateService() {
  const router = useRouter();

  return useMutation({
    mutationFn: (formData: FormData) => servicesClientApi.create(formData),
    onSuccess: (response) => {
      if (response.status_code === 201) {
        router.push("/dashboard/services");
      }
    },
  });
}
