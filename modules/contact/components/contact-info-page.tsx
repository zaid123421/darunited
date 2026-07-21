"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useSaveContactInfo } from "@/modules/contact/hooks/use-save-contact-info";
import { mapContactInfoToForm } from "@/modules/contact/lib/map-contact-info-to-form";
import { parseContactApiError } from "@/modules/contact/lib/parse-contact-api-error";
import {
  contactInfoSchema,
  type ContactInfoValues,
} from "@/modules/contact/schemas/contact.schema";
import type { ContactInfo, ContactInfoMode } from "@/modules/contact/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Input } from "@/shared/components/ui/input";
import { Toggle } from "@/shared/components/ui/toggle";
import { ApiError } from "@/shared/types/global-response";

interface ContactInfoPageProps {
  contactInfo: ContactInfo | null;
  mode: ContactInfoMode;
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

type PhoneToDelete = {
  index: number;
  phoneNumber: string;
};

export function ContactInfoPage({ contactInfo, mode }: ContactInfoPageProps) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [phoneToDelete, setPhoneToDelete] = useState<PhoneToDelete | null>(null);

  const saveContactInfo = useSaveContactInfo({
    onSuccess: (message) => {
      setGeneralError(null);
      setFeedback({
        type: "success",
        message: message || "Contact info saved successfully.",
      });
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<ContactInfoValues>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: mapContactInfoToForm(contactInfo),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "phoneNumbers",
  });

  const email = watch("email");
  const address = watch("address");

  useEffect(() => {
    if (errors.email?.type === "server") {
      clearErrors("email");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, clearErrors]);

  useEffect(() => {
    if (errors.address?.type === "server") {
      clearErrors("address");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, clearErrors]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const handleApiError = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      setGeneralError("Something went wrong. Please try again.");
      return;
    }

    const parsed = parseContactApiError(error);

    if (parsed.email) {
      setError("email", { type: "server", message: parsed.email });
    }

    if (parsed.address) {
      setError("address", { type: "server", message: parsed.address });
    }

    if (parsed.phoneNumbers) {
      for (const [index, fieldError] of Object.entries(parsed.phoneNumbers)) {
        if (fieldError.phoneNumber) {
          setError(`phoneNumbers.${Number(index)}.phoneNumber`, {
            type: "server",
            message: fieldError.phoneNumber,
          });
        }
      }
    }

    if (parsed.general) {
      setGeneralError(parsed.general);
    }
  };

  const onSubmit = (values: ContactInfoValues) => {
    setGeneralError(null);
    setFeedback(null);

    saveContactInfo.mutate(
      {
        mode,
        body: {
          email: values.email.trim(),
          address: values.address.trim(),
          phoneNumbers: values.phoneNumbers.map((phone) => ({
            phoneNumber: phone.phoneNumber.trim(),
            hasWhatsapp: phone.hasWhatsapp,
            whatsappUrl: null,
          })),
        },
      },
      { onError: handleApiError },
    );
  };

  const handleDeleteConfirm = () => {
    if (phoneToDelete === null) {
      return;
    }

    remove(phoneToDelete.index);
    setPhoneToDelete(null);
  };

  const deleteDialogTitle = phoneToDelete?.phoneNumber.trim()
    ? `"${phoneToDelete.phoneNumber.trim()}"`
    : "this phone number";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Contact Info</h1>
        <p className="page-subtitle mt-1">
          Manage contact details shown on the landing page.
        </p>
      </div>

      {feedback ? (
        <FeedbackBanner
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      ) : null}

      {generalError ? (
        <FeedbackBanner
          type="error"
          message={generalError}
          onDismiss={() => setGeneralError(null)}
        />
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardTitle>General Information</CardTitle>
          <CardDescription className="mb-5">
            Email and address displayed in the contact section.
          </CardDescription>

          <div className="grid gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="info@darunited.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Address"
              placeholder="Damascus, Syria"
              error={errors.address?.message}
              {...register("address")}
            />
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Phone Numbers</CardTitle>
              <CardDescription>
                Add phone numbers and mark which ones have WhatsApp.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => append({ phoneNumber: "", hasWhatsapp: false })}
            >
              <Plus className="h-4 w-4" />
              Add Phone
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {fields.map((field, index) => {
              const hasWhatsapp = watch(`phoneNumbers.${index}.hasWhatsapp`);

              return (
              <div
                key={field.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Input
                      label={`Phone ${index + 1}`}
                      placeholder="+20 10 95640474"
                      error={errors.phoneNumbers?.[index]?.phoneNumber?.message}
                      {...register(`phoneNumbers.${index}.phoneNumber`)}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:pb-1">
                    <Toggle
                      label="WhatsApp"
                      checked={hasWhatsapp}
                      onChange={(checked) => {
                        setValue(`phoneNumbers.${index}.hasWhatsapp`, checked, {
                          shouldValidate: true,
                        });
                      }}
                    />

                    {fields.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          setPhoneToDelete({
                            index,
                            phoneNumber: watch(`phoneNumbers.${index}.phoneNumber`),
                          })
                        }
                        aria-label={`Remove phone ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
            })}

            {errors.phoneNumbers?.message ? (
              <p className="text-xs text-destructive">{errors.phoneNumbers.message}</p>
            ) : null}
            {errors.phoneNumbers?.root?.message ? (
              <p className="text-xs text-destructive">
                {errors.phoneNumbers.root.message}
              </p>
            ) : null}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={saveContactInfo.isPending}
          >
            {saveContactInfo.isPending ? "Saving..." : "Save Contact Info"}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={phoneToDelete !== null}
        title="Delete phone number"
        description={`Are you sure you want to remove ${deleteDialogTitle}? Save to apply changes.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPhoneToDelete(null)}
      />
    </div>
  );
}
