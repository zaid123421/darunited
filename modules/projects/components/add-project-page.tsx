"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useGalleryEdit } from "@/modules/media/hooks/use-gallery-edit";
import { EntityMainPicSection } from "@/modules/media/components/entity-main-pic-section";
import { EntityMediaSection } from "@/modules/media/components/entity-media-section";
import { PROJECT_FORM_DEFAULTS } from "@/modules/projects/constants";
import { useCreateProject } from "@/modules/projects/hooks/use-create-project";
import { buildProjectFormData } from "@/modules/projects/lib/build-project-form-data";
import { parseProjectApiError } from "@/modules/projects/lib/parse-project-api-error";
import {
  projectFormSchema,
  type ProjectFormSubmitValues,
  type ProjectFormValues,
} from "@/modules/projects/schemas/project.schema";
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  isAllowedImageFile,
} from "@/modules/media/lib/media-file-validation";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

export function AddProjectPage() {
  const createProject = useCreateProject();
  const [mainPicFile, setMainPicFile] = useState<File | null>(null);
  const [mainPicPreview, setMainPicPreview] = useState<string | null>(null);
  const [mainPicError, setMainPicError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const {
    media: galleryMedia,
    addFiles: addGalleryFiles,
    removeAt: removeGalleryAt,
    reorderMedia: reorderGallery,
  } = useGalleryEdit([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProjectFormValues, unknown, ProjectFormSubmitValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: PROJECT_FORM_DEFAULTS,
  });

  const description = watch("description");
  const title = watch("title");

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
  }, [mainPicPreview, mainPicFile]);

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
  };

  const handleMainPicRemove = () => {
    if (mainPicPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(mainPicPreview);
    }

    setMainPicPreview(null);
    setMainPicFile(null);
    setMainPicError(null);
  };

  const handleGalleryAddFiles = (files: FileList) => {
    const result = addGalleryFiles(files);

    if (result.invalidImageMessage) {
      setMediaError(result.invalidImageMessage);
    }
  };

  const handleApiError = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      return; // hook already toasted
    }

    const parsed = parseProjectApiError(error);

    if (parsed.title) {
      setError("title", { type: "server", message: parsed.title });
    }

    if (parsed.description) {
      setError("description", { type: "server", message: parsed.description });
    }

    if (parsed.mainPic) {
      setMainPicError(parsed.mainPic);
    }

    if (parsed.media) {
      setMediaError(parsed.media);
    }

    if (parsed.general) {
      toast.error(parsed.general);
    }
  };

  const onSubmit = (values: ProjectFormSubmitValues) => {
    setMediaError(null);
    setMainPicError(null);
    clearErrors();
    createProject.reset();

    const hasInvalidGalleryImage = galleryMedia.some(
      (item) => item.kind === "image" && item.file && !isAllowedImageFile(item.file),
    );

    if (hasInvalidGalleryImage) {
      setMediaError(INVALID_IMAGE_TYPE_MESSAGE);
      return;
    }

    if (!mainPicFile) {
      setMainPicError("A main image is required.");
      return;
    }

    const formData = buildProjectFormData({
      title: values.title,
      description: values.description,
      mainPicFile,
      galleryMedia,
    });

    createProject.mutate(formData, {
      onError: handleApiError,
    });
  };

  return (
    <div className="flex min-h-full w-full flex-col pb-24 sm:pb-28">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <h1 className="page-title mt-4">Add Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new portfolio project
        </p>
      </div>

      <form
        id="add-project-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <Card className="p-4 sm:p-6">
          <CardTitle className="mb-4 text-sm font-semibold sm:mb-6 sm:text-base">
            Project Information
          </CardTitle>

          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="project-title"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Project Title
              </label>
              <Input
                id="project-title"
                placeholder="e.g. Brand Campaign 2026"
                className="h-12 rounded-xl bg-input"
                error={errors.title?.message}
                {...register("title")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="project-description"
                className="text-sm font-medium text-muted-foreground"
              >
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="project-description"
                rows={5}
                placeholder="Describe the project..."
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
                <p className="text-xs text-destructive">{errors.description.message}</p>
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
          showMainBadge={false}
          error={mediaError ?? undefined}
          tipText="Drag to reorder gallery images and videos. The main thumbnail is managed separately above."
        />
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-background/40 backdrop-blur-md lg:left-[260px]">
        <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <Link
            href="/dashboard/projects"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Cancel changes
          </Link>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <Link
              href="/dashboard/projects"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              Cancel
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
              <Button
                type="submit"
                form="add-project-form"
                disabled={createProject.isPending}
                className={cn(
                  "h-9 flex-1 rounded-lg border border-white/15 px-3 text-xs sm:h-10 sm:flex-none sm:px-5 sm:text-sm",
                  createProject.isPending && "opacity-70",
                )}
              >
                {createProject.isPending ? "Publishing…" : "Publish Project"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
