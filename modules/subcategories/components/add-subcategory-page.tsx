"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { EntityMediaSection } from "@/modules/media/components/entity-media-section";
import { SUBCATEGORY_FORM_DEFAULTS } from "@/modules/subcategories/constants";
import { useCreateSubcategory } from "@/modules/subcategories/hooks/use-create-subcategory";
import { buildSubcategoryFormData } from "@/modules/subcategories/lib/build-subcategory-form-data";
import { parseSubcategoryApiError } from "@/modules/subcategories/lib/parse-subcategory-api-error";
import {
  subcategoryFormSchema,
  type SubcategoryFormSubmitValues,
  type SubcategoryFormValues,
} from "@/modules/subcategories/schemas/subcategory.schema";
import type { CategoryOption } from "@/modules/subcategories/types";
import { useMediaUpload } from "@/modules/media/hooks/use-media-upload";
import { INVALID_IMAGE_TYPE_MESSAGE, isAllowedImageFile } from "@/modules/media/lib/media-file-validation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

interface AddSubcategoryPageProps {
  categories: CategoryOption[];
}

export function AddSubcategoryPage({ categories }: AddSubcategoryPageProps) {
  const createSubcategory = useCreateSubcategory();
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { media, mainIndex, addFiles, removeAt, reorderMedia } = useMediaUpload(
    [],
    {
      onValidationError: setMediaError,
    },
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SubcategoryFormValues, unknown, SubcategoryFormSubmitValues>({
    resolver: zodResolver(subcategoryFormSchema),
    defaultValues: SUBCATEGORY_FORM_DEFAULTS,
  });

  const description = watch("description");
  const title = watch("title");
  const categoryId = watch("categoryId");

  const categoryOptions = categories.map((category) => ({
    label: category.title,
    value: String(category.id),
  }));

  useEffect(() => {
    if (errors.title?.type === "server") {
      clearErrors("title");
    }
    // Only clear server title errors when the user edits the field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, clearErrors]);

  useEffect(() => {
    if (mediaError) {
      setMediaError(null);
    }
    // Only clear media errors when the user changes uploaded files.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  const handleApiError = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      setGeneralError("Something went wrong. Please try again.");
      return;
    }

    const parsed = parseSubcategoryApiError(error);

    if (parsed.title) {
      setError("title", { type: "server", message: parsed.title });
    }

    if (parsed.categoryId) {
      setError("categoryId", { type: "server", message: parsed.categoryId });
    }

    if (parsed.media) {
      setMediaError(parsed.media);
    }

    if (parsed.general) {
      setGeneralError(parsed.general);
    }
  };

  const onSubmit = (values: SubcategoryFormSubmitValues) => {
    setMediaError(null);
    setGeneralError(null);
    clearErrors("title");
    createSubcategory.reset();

    const hasInvalidImage = media.some(
      (item) => item.kind === "image" && item.file && !isAllowedImageFile(item.file),
    );

    if (hasInvalidImage) {
      setMediaError(INVALID_IMAGE_TYPE_MESSAGE);
      return;
    }

    const formData = buildSubcategoryFormData({
      title: values.title,
      description: values.description,
      categoryId: values.categoryId,
      media,
      mainIndex,
    });

    createSubcategory.mutate(formData, {
      onError: handleApiError,
    });
  };

  const titleError = errors.title?.message;
  const showGeneralError =
    generalError && !titleError && !mediaError && !errors.categoryId;

  return (
    <div className="flex min-h-full w-full flex-col pb-24 sm:pb-28">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/dashboard/subcategories"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Subcategories
        </Link>

        <h1 className="page-title mt-4">
          Add Subcategory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new subcategory offering
        </p>
      </div>

      <form
        id="add-subcategory-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <Card className="p-4 sm:p-6">
          <CardTitle className="mb-4 text-sm font-semibold sm:mb-6 sm:text-base">
            Subcategory Information
          </CardTitle>

          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="subcategory-title"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Subcategory Title
              </label>
              <Input
                id="subcategory-title"
                placeholder="e.g. Professional Web Design"
                className="h-12 rounded-xl bg-input"
                error={titleError}
                {...register("title")}
              />
            </div>

            <Select
              label="Category"
              placeholder="Select a category"
              options={categoryOptions}
              value={categoryId ? String(categoryId) : ""}
              onValueChange={(value) =>
                setValue("categoryId", Number(value), { shouldValidate: true })
              }
              error={errors.categoryId?.message}
            />

            <div className="flex flex-col gap-2">
              <label
                htmlFor="subcategory-description"
                className="text-sm font-medium text-muted-foreground"
              >
                Description
              </label>
              <textarea
                id="subcategory-description"
                rows={5}
                placeholder="Describe this subcategory..."
                className={cn(
                  "min-h-[120px] w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60",
                  inputFocusRingClass,
                  errors.description &&
                    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive",
                )}
                value={description}
                onChange={(event) =>
                  setValue("description", event.target.value, { shouldValidate: true })
                }
              />
              {errors.description?.message ? (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <span>⚠</span> {errors.description.message}
                </p>
              ) : null}
            </div>
          </div>
        </Card>

        <EntityMediaSection
          title="Subcategory Media"
          media={media}
          mainIndex={mainIndex}
          onAddFiles={addFiles}
          onRemoveAt={removeAt}
          onReorderMedia={reorderMedia}
          error={mediaError ?? undefined}
        />

        {showGeneralError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {generalError}
          </div>
        ) : null}
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-background/40 backdrop-blur-md lg:left-[260px]">
        <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <Link
            href="/dashboard/subcategories"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Cancel changes
          </Link>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <Link
              href="/dashboard/subcategories"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              Cancel
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
              <Button
                type="submit"
                form="add-subcategory-form"
                disabled={createSubcategory.isPending}
                className={cn(
                  "h-9 flex-1 rounded-lg border border-white/15 px-3 text-xs sm:h-10 sm:flex-none sm:px-5 sm:text-sm",
                  createSubcategory.isPending && "opacity-70",
                )}
              >
                {createSubcategory.isPending ? "Publishing…" : "Publish Subcategory"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
