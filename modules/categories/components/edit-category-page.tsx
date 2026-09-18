"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { EntityMainPicSection } from "@/modules/media/components/entity-main-pic-section";
import { useUpdateCategory } from "@/modules/categories/hooks/use-update-category";
import { getCategoryPicUrl } from "@/modules/categories/lib/category-media-mappers";
import { parseCategoryApiError } from "@/modules/categories/lib/parse-category-api-error";
import {
  categoryFormSchema,
  type CategoryFormSubmitValues,
  type CategoryFormValues,
} from "@/modules/categories/schemas/category.schema";
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  isAllowedImageFile,
} from "@/modules/media/lib/media-file-validation";
import type { CategoryDetail, MainPicAction } from "@/modules/categories/types";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

interface EditCategoryPageProps {
  category: CategoryDetail;
}

export function EditCategoryPage({ category }: EditCategoryPageProps) {
  const initialPicUrl = getCategoryPicUrl(category);

  const updateCategory = useUpdateCategory({
    onSuccess: () => {
      setSuccessMessage("Category updated successfully.");
      setGeneralError(null);
    },
  });

  const [mainPicPreview, setMainPicPreview] = useState<string | null>(
    initialPicUrl,
  );
  const [mainPicFile, setMainPicFile] = useState<File | null>(null);
  const [mainPicError, setMainPicError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CategoryFormValues, unknown, CategoryFormSubmitValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      title: category.title,
      description: category.description ?? "",
    },
  });

  const description = watch("description");
  const title = watch("title");

  useEffect(() => {
    setMainPicPreview(initialPicUrl);
    setMainPicFile(null);
    setMainPicError(null);
    setGeneralError(null);
  }, [initialPicUrl, category.id]);

  useEffect(() => {
    if (errors.title?.type === "server") {
      clearErrors("title");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, clearErrors]);

  const hasMainPicChanges = Boolean(mainPicFile);

  const hasInfoChanges =
    title.trim() !== category.title.trim() ||
    (description?.trim() || "") !== (category.description?.trim() || "");

  const hasChanges = hasInfoChanges || hasMainPicChanges;

  const resolveMainPicAction = (): MainPicAction => {
    if (mainPicFile) {
      return "upload";
    }

    return "none";
  };

  const handleMainPicSelect = (file: File) => {
    if (!isAllowedImageFile(file)) {
      setMainPicError(INVALID_IMAGE_TYPE_MESSAGE);
      return;
    }

    if (mainPicPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(mainPicPreview);
    }

    setMainPicFile(file);
    setMainPicPreview(URL.createObjectURL(file));
    setMainPicError(null);
    setSuccessMessage(null);
  };

  const handleMainPicRemove = () => {
    if (mainPicPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(mainPicPreview);
    }

    // Backend cannot delete main pic without replacement — restore existing.
    setMainPicPreview(initialPicUrl);
    setMainPicFile(null);
    setMainPicError(
      initialPicUrl
        ? "To change the image, upload a replacement. Deleting without replace is not supported."
        : "A main image is required.",
    );
    setSuccessMessage(null);
  };

  const handleApiError = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      setGeneralError("Something went wrong. Please try again.");
      return;
    }

    const parsed = parseCategoryApiError(error);

    if (parsed.title) {
      setError("title", { type: "server", message: parsed.title });
    }

    if (parsed.mainPic || parsed.media) {
      setMainPicError(parsed.mainPic ?? parsed.media ?? null);
    }

    if (parsed.general) {
      setGeneralError(parsed.general);
    }
  };

  const onSubmit = (values: CategoryFormSubmitValues) => {
    setMainPicError(null);
    setGeneralError(null);
    setSuccessMessage(null);
    clearErrors("title");

    if (!hasChanges) {
      setGeneralError("No changes to save.");
      return;
    }

    updateCategory.mutate(
      {
        id: category.id,
        title: values.title,
        description: values.description,
        initialTitle: category.title,
        initialDescription: category.description ?? undefined,
        mainPicAction: resolveMainPicAction(),
        mainPicFile: mainPicFile ?? undefined,
      },
      {
        onError: handleApiError,
      },
    );
  };

  const titleError = errors.title?.message;
  const showGeneralError = generalError && !titleError && !mainPicError;

  return (
    <div className="flex min-h-full w-full flex-col pb-24 sm:pb-28">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/dashboard/categories"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        <h1 className="page-title mt-4">Edit Category</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update category details and main image
        </p>
      </div>

      {successMessage ? (
        <div className="mb-4 sm:mb-5">
          <FeedbackBanner
            type="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        </div>
      ) : null}

      <form
        id="edit-category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <Card className="p-4 sm:p-6">
          <CardTitle className="mb-4 text-sm font-semibold sm:mb-6 sm:text-base">
            Category Information
          </CardTitle>

          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="category-title"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Category Title
              </label>
              <Input
                id="category-title"
                placeholder="e.g. Professional Web Design"
                className="h-12 rounded-xl bg-input"
                error={titleError}
                {...register("title")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="category-description"
                className="text-sm font-medium text-muted-foreground"
              >
                Description
              </label>
              <textarea
                id="category-description"
                rows={5}
                placeholder="Describe this category..."
                className={cn(
                  "min-h-[120px] w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60",
                  inputFocusRingClass,
                  errors.description &&
                    "border-destructive focus-visible:border-destructive focus-visible:ring-destructive",
                )}
                value={description ?? ""}
                onChange={(event) =>
                  setValue("description", event.target.value, {
                    shouldValidate: true,
                  })
                }
              />
              {errors.description?.message ? (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  {errors.description.message}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Note: the API does not return description after save, so this
                field may appear empty when you reopen the page.
              </p>
            </div>
          </div>
        </Card>

        <EntityMainPicSection
          previewUrl={mainPicPreview}
          onSelectFile={handleMainPicSelect}
          onRemove={handleMainPicRemove}
          error={mainPicError ?? undefined}
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
            href="/dashboard/categories"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Cancel changes
          </Link>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <Link
              href="/dashboard/categories"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              Cancel
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
              <Button
                type="submit"
                form="edit-category-form"
                disabled={updateCategory.isPending || !hasChanges}
                className={cn(
                  "h-9 flex-1 rounded-lg border border-white/15 px-3 text-xs sm:h-10 sm:flex-none sm:px-5 sm:text-sm",
                  updateCategory.isPending && "opacity-70",
                )}
              >
                {updateCategory.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
