"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { servicesClientApi } from "@/modules/services/api/services.client.api";
import type { UpdateServiceInput } from "@/modules/services/types";

interface UseUpdateServiceOptions {
  onSuccess?: () => void;
}

export function useUpdateService(options: UseUpdateServiceOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateServiceInput) => servicesClientApi.updateService(input),
    onSuccess: () => {
      router.refresh();
      options.onSuccess?.();
    },
  });
}
