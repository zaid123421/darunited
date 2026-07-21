"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { contactClientApi } from "@/modules/contact/api/contact.client.api";
import type { ContactInfoMode, ContactInfoPayload } from "@/modules/contact/types";

interface SaveContactInfoInput {
  mode: ContactInfoMode;
  body: ContactInfoPayload;
}

interface UseSaveContactInfoOptions {
  onSuccess?: (message: string) => void;
}

export function useSaveContactInfo(options: UseSaveContactInfoOptions = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ mode, body }: SaveContactInfoInput) =>
      mode === "create"
        ? contactClientApi.create(body)
        : contactClientApi.update(body),
    onSuccess: (response) => {
      router.refresh();
      options.onSuccess?.(response.message);
    },
  });
}
