"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { productionClientApi } from "@/modules/production/api/production.client.api";
import type { GlobalResponse } from "@/shared/types/global-response";
import { ApiError } from "@/shared/types/global-response";

interface UseDeleteProductionSectionOptions {
  onSuccess?: (response: GlobalResponse<null>) => void;
  onError?: (error: ApiError) => void;
}

export function useDeleteProductionSection(
  options: UseDeleteProductionSectionOptions = {},
) {
  const router = useRouter();

  return useMutation({
    mutationFn: (id: number | string) => productionClientApi.delete(id),
    onSuccess: (response) => {
      toast.success(
        response.message || "Production section deleted successfully.",
      );
      router.refresh();
      options.onSuccess?.(response);
    },
    onError: (error) => {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError("Something went wrong. Please try again.", 500);

      toast.error(
        apiError.message ||
          "Failed to delete production section. Please try again.",
      );
      options.onError?.(apiError);
    },
  });
}
