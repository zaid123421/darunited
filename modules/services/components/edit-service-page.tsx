"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ServiceMainPicSection } from "@/modules/services/components/service-main-pic-section";
import { ServiceMediaSection } from "@/modules/services/components/service-media-section";
import { useGalleryEdit } from "@/modules/services/hooks/use-gallery-edit";
import { useUpdateService } from "@/modules/services/hooks/use-update-service";
import {
  getGalleryFromService,
  getMainPicFromService,
} from "@/modules/services/lib/service-media-mappers";
import { parseServiceApiError } from "@/modules/services/lib/parse-service-api-error";
import {
  serviceFormSchema,
  type ServiceFormSubmitValues,
  type ServiceFormValues,
} from "@/modules/services/schemas/service.schema";
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  isAllowedImageFile,
} from "@/modules/media/lib/media-file-validation";
import type { MainPicAction, ServiceDetail } from "@/modules/services/types";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

interface EditServicePageProps {
  service: ServiceDetail;
}

export function EditServicePage({ service }: EditServicePageProps) {
  const initialMainPic = getMainPicFromService(service);
  const initialGallery = useMemo(() => getGalleryFromService(service), [service]);

  const updateService = useUpdateService({
    onSuccess: () => {
      setSuccessMessage("Service updated successfully.");
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
  } = useForm<ServiceFormValues, unknown, ServiceFormSubmitValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: service.title,
      description: service.description ?? "",
    },
  });

  const description = watch("description");
  const title = watch("title");

  useEffect(() => {
    resetGallery(initialGallery);
    setMainPicPreview(initialMainPic?.url ?? null);
    setMainPicFile(null);
    setMainPicRemoved(false);
    setMainPicError(null);
    setMediaError(null);
    setGeneralError(null);
  }, [initialGallery, initialMainPic?.url, resetGallery, service.id]);

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
    title.trim() !== service.title.trim() ||
    (description?.trim() || "") !== (service.description?.trim() || "");

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

    const parsed = parseServiceApiError(error);

    if (parsed.title) {
      setError("title", { type: "server", message: parsed.title });
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

  const onSubmit = (values: ServiceFormSubmitValues) => {
    setMediaError(null);
    setMainPicError(null);
    setGeneralError(null);
    setSuccessMessage(null);
    clearErrors("title");

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

    updateService.mutate(
      {
        id: service.id,
        title: values.title,
        description: values.description,
        initialTitle: service.title,
        initialDescription: service.description ?? undefined,
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
    generalError && !titleError && !mediaError && !mainPicError;

  return (
    <div className="flex min-h-full w-full flex-col pb-24 sm:pb-28">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/dashboard/services"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Services
        </Link>

        <h1 className="page-title mt-4">
          Edit Service
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update service details and media
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
        id="edit-service-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <Card className="p-4 sm:p-6">
          <CardTitle className="mb-4 text-sm font-semibold sm:mb-6 sm:text-base">
            Service Information
          </CardTitle>

          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="service-title"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Service Title
              </label>
              <Input
                id="service-title"
                placeholder="e.g. Professional Web Design"
                className="h-12 rounded-xl bg-input"
                error={titleError}
                {...register("title")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="service-description"
                className="text-sm font-medium text-muted-foreground"
              >
                Description
              </label>
              <textarea
                id="service-description"
                rows={5}
                placeholder="Describe this service..."
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

        <ServiceMainPicSection
          previewUrl={mainPicPreview}
          onSelectFile={handleMainPicSelect}
          onRemove={handleMainPicRemove}
          error={mainPicError ?? undefined}
        />

        <ServiceMediaSection
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
            href="/dashboard/services"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Cancel changes
          </Link>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <Link
              href="/dashboard/services"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              Cancel
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
              <Button
                type="submit"
                form="edit-service-form"
                disabled={updateService.isPending || !hasChanges}
                className={cn(
                  "h-9 flex-1 rounded-lg border border-white/15 px-3 text-xs sm:h-10 sm:flex-none sm:px-5 sm:text-sm",
                  updateService.isPending && "opacity-70",
                )}
              >
                {updateService.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
