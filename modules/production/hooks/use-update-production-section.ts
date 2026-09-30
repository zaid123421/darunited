"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productionClientApi } from "@/modules/production/api/production.client.api";
import type { UpdateProductionSectionInput } from "@/modules/production/types";
import { ApiError } from "@/shared/types/global-response";

interface UseUpdateProductionSectionOptions {
  onSuccess?: () => void;
}

export function useUpdateProductionSection(
  options: UseUpdateProductionSectionOptions = {},
) {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: UpdateProductionSectionInput) =>
      productionClientApi.updateSection(input),
    onSuccess: () => {
      toast.success("Production section updated successfully.");
      router.refresh();
      options.onSuccess?.();
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Failed to update production section. Please try again.");
      }
    },
  });
}
