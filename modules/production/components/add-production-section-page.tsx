"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { EntityMediaSection } from "@/modules/media/components/entity-media-section";
import { useMediaUpload } from "@/modules/media/hooks/use-media-upload";
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  isAllowedImageFile,
} from "@/modules/media/lib/media-file-validation";
import { useCreateProductionSection } from "@/modules/production/hooks/use-create-production-section";
import { buildProductionFormData } from "@/modules/production/lib/build-production-form-data";
import { parseProductionApiError } from "@/modules/production/lib/parse-production-api-error";
import {
  productionSectionFormSchema,
  type ProductionSectionFormSubmitValues,
  type ProductionSectionFormValues,
} from "@/modules/production/schemas/production.schema";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

export function AddProductionSectionPage() {
  const createSection = useCreateProductionSection();
  const [mediaError, setMediaError] = useState<string | null>(null);
  const { media, mainIndex, addFiles, removeAt, reorderMedia } = useMediaUpload(
    [],
    { onValidationError: setMediaError },
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<
    ProductionSectionFormValues,
    unknown,
    ProductionSectionFormSubmitValues
  >({
    resolver: zodResolver(productionSectionFormSchema),
    defaultValues: {
      title: "",
      script: "",
      features: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
    keyName: "fieldKey",
  });

  const title = watch("title");
  const script = watch("script");

  useEffect(() => {
    if (errors.title?.type === "server") {
      clearErrors("title");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, clearErrors]);

  useEffect(() => {
    if (mediaError) {
      setMediaError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  const handleApiError = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      return;
    }

    const parsed = parseProductionApiError(error);

    if (parsed.title) {
      setError("title", { type: "server", message: parsed.title });
    }

    if (parsed.script) {
      setError("script", { type: "server", message: parsed.script });
    }

    if (parsed.features) {
      for (const [index, fieldError] of Object.entries(parsed.features)) {
        if (fieldError.title) {
          setError(`features.${Number(index)}.title`, {
            type: "server",
            message: fieldError.title,
          });
        }

        if (fieldError.script) {
          setError(`features.${Number(index)}.script`, {
            type: "server",
            message: fieldError.script,
          });
        }
      }
    }

    if (parsed.media) {
      setMediaError(parsed.media);
    }

    if (parsed.general) {
      toast.error(parsed.general);
    }
  };

  const onSubmit = (values: ProductionSectionFormSubmitValues) => {
    setMediaError(null);
    clearErrors();

    if (media.length === 0) {
      setMediaError("Add at least one image or video.");
      return;
    }

    const hasInvalidImage = media.some(
      (item) => item.kind === "image" && item.file && !isAllowedImageFile(item.file),
    );

    if (hasInvalidImage) {
      setMediaError(INVALID_IMAGE_TYPE_MESSAGE);
      return;
    }

    createSection.mutate(
      buildProductionFormData({
        title: values.title,
        script: values.script,
        features: values.features.map((feature) => ({
          title: feature.title,
          script: feature.script,
        })),
        media,
      }),
      { onError: handleApiError },
    );
  };

  return (
    <div className="flex min-h-full w-full flex-col pb-24 sm:pb-28">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/dashboard/production"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Production
        </Link>

        <h1 className="page-title mt-4">Add Production Section</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a production section with features and media.
        </p>
      </div>

      <form
        id="add-production-section-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <Card className="p-4 sm:p-6">
          <CardTitle className="mb-4 text-sm font-semibold sm:mb-6 sm:text-base">
            Section Information
          </CardTitle>

          <div className="flex flex-col gap-4 sm:gap-6">
            <Input
              label="Title"
              placeholder="Laser Cutting"
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="flex min-w-0 flex-col gap-2">
              <label
                htmlFor="production-script"
                className="text-sm font-medium text-foreground"
              >
                Script
              </label>
              <textarea
                id="production-script"
                rows={6}
                placeholder="Describe this production capability."
                className={cn(
                  "min-h-[140px] w-full max-w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60",
                  inputFocusRingClass,
                  errors.script &&
                    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive",
                )}
                value={script}
                onChange={(event) =>
                  setValue("script", event.target.value, { shouldValidate: true })
                }
              />
              {errors.script?.message ? (
                <p className="text-xs text-destructive">{errors.script.message}</p>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
            <CardTitle className="text-sm font-semibold sm:text-base">
              Features
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: "", script: "", isNew: true })}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Feature
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Optional. Add capacity highlights or process features.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <div
                  key={field.fieldKey}
                  className="rounded-xl border border-border bg-muted/20 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Feature {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(index)}
                      aria-label={`Remove feature ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Input
                      label="Title"
                      placeholder="High precision"
                      error={errors.features?.[index]?.title?.message}
                      {...register(`features.${index}.title`)}
                    />
                    <div className="flex min-w-0 flex-col gap-2">
                      <label
                        htmlFor={`feature-script-${index}`}
                        className="text-sm font-medium text-foreground"
                      >
                        Script
                      </label>
                      <textarea
                        id={`feature-script-${index}`}
                        rows={3}
                        placeholder="Feature details"
                        className={cn(
                          "min-h-[90px] w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60",
                          inputFocusRingClass,
                          errors.features?.[index]?.script &&
                            "border-destructive focus-visible:border-destructive focus-visible:ring-destructive",
                        )}
                        {...register(`features.${index}.script`)}
                      />
                      {errors.features?.[index]?.script?.message ? (
                        <p className="text-xs text-destructive">
                          {errors.features[index]?.script?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <EntityMediaSection
          media={media}
          mainIndex={mainIndex}
          onAddFiles={addFiles}
          onRemoveAt={removeAt}
          onReorderMedia={reorderMedia}
          showMainBadge={false}
          error={mediaError ?? undefined}
          tipText="At least one image or video is required. Drag to reorder."
        />
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-background/40 backdrop-blur-md transition-[left] duration-200 lg:left-[var(--dashboard-sidebar-offset)]">
        <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <Link
            href="/dashboard/production"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Cancel changes
          </Link>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <Link
              href="/dashboard/production"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              Cancel
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
              <Button
                type="submit"
                form="add-production-section-form"
                disabled={createSection.isPending}
                className={cn(
                  "h-9 flex-1 rounded-lg border border-white/15 px-3 text-xs sm:h-10 sm:flex-none sm:px-5 sm:text-sm",
                  createSection.isPending && "opacity-70",
                )}
              >
                {createSection.isPending ? "Publishing…" : "Publish Section"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
