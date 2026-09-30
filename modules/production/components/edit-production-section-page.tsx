"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { EntityMediaSection } from "@/modules/media/components/entity-media-section";
import { useGalleryEdit } from "@/modules/media/hooks/use-gallery-edit";
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  isAllowedImageFile,
} from "@/modules/media/lib/media-file-validation";
import { useUpdateProductionSection } from "@/modules/production/hooks/use-update-production-section";
import {
  getGalleryFromProductionSection,
  mapFeaturesToPayload,
} from "@/modules/production/lib/production-media-mappers";
import { parseProductionApiError } from "@/modules/production/lib/parse-production-api-error";
import {
  productionSectionFormSchema,
  type ProductionSectionFormSubmitValues,
  type ProductionSectionFormValues,
} from "@/modules/production/schemas/production.schema";
import type { ProductionSection } from "@/modules/production/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

interface EditProductionSectionPageProps {
  section: ProductionSection;
}

function sameFeatureState(
  left: ProductionSectionFormSubmitValues["features"],
  right: ReturnType<typeof mapFeaturesToPayload>,
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((feature, index) => {
    const other = right[index];
    if (!other) return false;

    return (
      (feature.id ?? null) === (other.id ?? null) &&
      feature.title.trim() === other.title.trim() &&
      feature.script.trim() === other.script.trim()
    );
  });
}

export function EditProductionSectionPage({
  section,
}: EditProductionSectionPageProps) {
  const updateSection = useUpdateProductionSection();
  const initialGallery = useMemo(
    () => getGalleryFromProductionSection(section),
    [section],
  );
  const initialFeatures = useMemo(
    () => mapFeaturesToPayload(section.features ?? []),
    [section],
  );
  const [mediaError, setMediaError] = useState<string | null>(null);

  const {
    media: galleryMedia,
    galleryChanged,
    addFiles: addGalleryFiles,
    removeAt: removeGalleryAt,
    reorderMedia: reorderGallery,
    resetGallery,
  } = useGalleryEdit(initialGallery);

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
      title: section.title,
      script: section.script,
      features: (section.features ?? []).map((feature) => ({
        id: feature.id,
        title: feature.title,
        script: feature.script,
        isNew: false,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
    keyName: "fieldKey",
  });

  const title = watch("title");
  const script = watch("script");
  const features = watch("features");

  useEffect(() => {
    resetGallery(initialGallery);
    setMediaError(null);
  }, [initialGallery, resetGallery, section.id]);

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
  }, [galleryMedia]);

  const hasInfoChanges =
    title.trim() !== section.title.trim() ||
    script.trim() !== section.script.trim() ||
    !sameFeatureState(features ?? [], initialFeatures);

  const hasChanges = hasInfoChanges || galleryChanged;

  const handleGalleryAddFiles = (files: FileList) => {
    const result = addGalleryFiles(files);

    if (result.invalidImageMessage) {
      setMediaError(result.invalidImageMessage);
    }
  };

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

    if (!hasChanges) {
      toast.error("No changes to save.");
      return;
    }

    const hasInvalidGalleryImage = galleryMedia.some(
      (item) => item.kind === "image" && item.file && !isAllowedImageFile(item.file),
    );

    if (hasInvalidGalleryImage) {
      setMediaError(INVALID_IMAGE_TYPE_MESSAGE);
      return;
    }

    updateSection.mutate(
      {
        id: section.id,
        title: values.title,
        script: values.script,
        features: values.features.map((feature) => ({
          ...(feature.id != null ? { id: feature.id } : {}),
          title: feature.title,
          script: feature.script,
        })),
        initialTitle: section.title,
        initialScript: section.script,
        initialFeatures,
        galleryItems: galleryMedia,
        galleryChanged,
      },
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

        <h1 className="page-title mt-4">Edit Production Section</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update section details, features, and media.
        </p>
      </div>

      <form
        id="edit-production-section-form"
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
                htmlFor="production-script-edit"
                className="text-sm font-medium text-foreground"
              >
                Script
              </label>
              <textarea
                id="production-script-edit"
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
                        htmlFor={`feature-script-edit-${index}`}
                        className="text-sm font-medium text-foreground"
                      >
                        Script
                      </label>
                      <textarea
                        id={`feature-script-edit-${index}`}
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
          media={galleryMedia}
          mainIndex={galleryMedia.findIndex((item) => item.kind === "image")}
          onAddFiles={handleGalleryAddFiles}
          onRemoveAt={removeGalleryAt}
          onReorderMedia={reorderGallery}
          showMainBadge={false}
          error={mediaError ?? undefined}
          tipText="Drag to reorder gallery items. You can add or remove images and videos."
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
                form="edit-production-section-form"
                disabled={updateSection.isPending || !hasChanges}
                className={cn(
                  "h-9 flex-1 rounded-lg border border-white/15 px-3 text-xs sm:h-10 sm:flex-none sm:px-5 sm:text-sm",
                  updateSection.isPending && "opacity-70",
                )}
              >
                {updateSection.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
