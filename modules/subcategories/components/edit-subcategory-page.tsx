"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { EntityMainPicSection } from "@/modules/media/components/entity-main-pic-section";
import { EntityMediaSection } from "@/modules/media/components/entity-media-section";
import { useGalleryEdit } from "@/modules/media/hooks/use-gallery-edit";
import { useUpdateSubcategory } from "@/modules/subcategories/hooks/use-update-subcategory";
import {
  getGalleryFromSubcategory,
  getMainPicFromSubcategory,
} from "@/modules/subcategories/lib/subcategory-media-mappers";
import { parseSubcategoryApiError } from "@/modules/subcategories/lib/parse-subcategory-api-error";
import {
  subcategoryFormSchema,
  type SubcategoryFormSubmitValues,
  type SubcategoryFormValues,
} from "@/modules/subcategories/schemas/subcategory.schema";
import type {
  CategoryOption,
  MainPicAction,
  SubcategoryDetail,
} from "@/modules/subcategories/types";
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  isAllowedImageFile,
} from "@/modules/media/lib/media-file-validation";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

interface EditSubcategoryPageProps {
  subcategory: SubcategoryDetail;
  categories: CategoryOption[];
}

export function EditSubcategoryPage({
  subcategory,
  categories,
}: EditSubcategoryPageProps) {
  const initialMainPic = getMainPicFromSubcategory(subcategory);
  const initialGallery = useMemo(
    () => getGalleryFromSubcategory(subcategory),
    [subcategory],
  );

  const updateSubcategory = useUpdateSubcategory({
    onSuccess: () => {
      setSuccessMessage("Subcategory updated successfully.");
      setGeneralError(null);
    },
  });

  const {
    media: galleryMedia,
    galleryChanged,
    addFiles: addGalleryFiles,
    removeAt: removeGalleryAt,
    reorderMedia: reorderGallery,
    resetGallery,
  } = useGalleryEdit(initialGallery);

  const [mainPicPreview, setMainPicPreview] = useState<string | null>(
    initialMainPic?.url ?? null,
  );
  const [mainPicFile, setMainPicFile] = useState<File | null>(null);
  const [mainPicRemoved, setMainPicRemoved] = useState(false);
  const [mainPicError, setMainPicError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
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
  } = useForm<SubcategoryFormValues, unknown, SubcategoryFormSubmitValues>({
    resolver: zodResolver(subcategoryFormSchema),
    defaultValues: {
      title: subcategory.title,
      description: subcategory.description ?? "",
      categoryId: subcategory.categoryId,
    },
  });

  const description = watch("description");
  const title = watch("title");
  const categoryId = watch("categoryId");

  const categoryOptions = categories.map((category) => ({
    label: category.title,
    value: String(category.id),
  }));

  useEffect(() => {
    resetGallery(initialGallery);
    setMainPicPreview(initialMainPic?.url ?? null);
    setMainPicFile(null);
    setMainPicRemoved(false);
    setMainPicError(null);
    setMediaError(null);
    setGeneralError(null);
  }, [initialGallery, initialMainPic?.url, resetGallery, subcategory.id]);

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

  useEffect(() => {
    if (mainPicError) {
      setMainPicError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainPicPreview, mainPicFile, mainPicRemoved]);

  const hasMainPicChanges =
    Boolean(mainPicFile) || (Boolean(initialMainPic) && mainPicRemoved && !mainPicFile);

  const hasInfoChanges =
    title.trim() !== subcategory.title.trim() ||
    (description?.trim() || "") !== (subcategory.description?.trim() || "") ||
    Number(categoryId) !== subcategory.categoryId;

  const hasChanges = hasInfoChanges || hasMainPicChanges || galleryChanged;

  const resolveMainPicAction = (): MainPicAction => {
    if (mainPicFile) {
      return "upload";
    }

    if (initialMainPic && mainPicRemoved) {
      return "delete";
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
    setMainPicRemoved(false);
    setMainPicError(null);
    setSuccessMessage(null);
  };

  const handleMainPicRemove = () => {
    if (mainPicPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(mainPicPreview);
    }

    setMainPicPreview(null);
    setMainPicFile(null);
    setMainPicRemoved(true);
    setMainPicError(null);
    setSuccessMessage(null);
  };

  const handleGalleryAddFiles = (files: FileList) => {
    const result = addGalleryFiles(files);

    if (result.invalidImageMessage) {
      setMediaError(result.invalidImageMessage);
      return;
    }

    setSuccessMessage(null);
  };

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

    if (parsed.mainPic) {
      setMainPicError(parsed.mainPic);
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
    setMainPicError(null);
    setGeneralError(null);
    setSuccessMessage(null);
    clearErrors("title");
    clearErrors("categoryId");

    if (!hasChanges) {
      setGeneralError("No changes to save.");
      return;
    }

    const hasInvalidGalleryImage = galleryMedia.some(
      (item) => item.kind === "image" && item.file && !isAllowedImageFile(item.file),
    );

    if (hasInvalidGalleryImage) {
      setMediaError(INVALID_IMAGE_TYPE_MESSAGE);
      return;
    }

    updateSubcategory.mutate(
      {
        id: subcategory.id,
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        initialTitle: subcategory.title,
        initialDescription: subcategory.description ?? undefined,
        initialCategoryId: subcategory.categoryId,
        mainPicAction: resolveMainPicAction(),
        mainPicFile: mainPicFile ?? undefined,
        galleryItems: galleryMedia,
        galleryChanged,
      },
      {
        onError: handleApiError,
      },
    );
  };

  const titleError = errors.title?.message;
  const showGeneralError =
    generalError && !titleError && !mediaError && !mainPicError && !errors.categoryId;

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

        <h1 className="page-title mt-4">Edit Subcategory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update subcategory details and media
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
        id="edit-subcategory-form"
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
                value={description ?? ""}
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

        <EntityMainPicSection
          previewUrl={mainPicPreview}
          onSelectFile={handleMainPicSelect}
          onRemove={handleMainPicRemove}
          error={mainPicError ?? undefined}
        />

        <EntityMediaSection
          title="Gallery Media"
          media={galleryMedia}
          mainIndex={-1}
          onAddFiles={handleGalleryAddFiles}
          onRemoveAt={removeGalleryAt}
          onReorderMedia={reorderGallery}
          canRemoveItem={(item) => !item.id}
          error={mediaError ?? undefined}
          showMainBadge={false}
          tipText="Drag to reorder gallery items. You can add new media, but existing items cannot be removed."
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
                form="edit-subcategory-form"
                disabled={updateSubcategory.isPending || !hasChanges}
                className={cn(
                  "h-9 flex-1 rounded-lg border border-white/15 px-3 text-xs sm:h-10 sm:flex-none sm:px-5 sm:text-sm",
                  updateSubcategory.isPending && "opacity-70",
                )}
              >
                {updateSubcategory.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
