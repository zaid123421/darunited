"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EntityMediaSection } from "@/modules/media/components/entity-media-section";
import { useMediaUpload } from "@/modules/media/hooks/use-media-upload";
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  isAllowedImageFile,
} from "@/modules/media/lib/media-file-validation";
import { useCreateAboutSection } from "@/modules/about/hooks/use-create-about-section";
import { buildAboutFormData } from "@/modules/about/lib/build-about-form-data";
import { parseAboutApiError } from "@/modules/about/lib/parse-about-api-error";
import {
  aboutUsSectionFormSchema,
  type AboutUsSectionFormSubmitValues,
  type AboutUsSectionFormValues,
} from "@/modules/about/schemas/about.schema";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

export function AddAboutSectionPage() {
  const createSection = useCreateAboutSection();
  const [mediaError, setMediaError] = useState<string | null>(null);
  const { media, mainIndex, addFiles, removeAt, reorderMedia } = useMediaUpload(
    [],
    { onValidationError: setMediaError },
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AboutUsSectionFormValues, unknown, AboutUsSectionFormSubmitValues>(
    {
      resolver: zodResolver(aboutUsSectionFormSchema),
      defaultValues: { title: "", script: "" },
    },
  );

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

    const parsed = parseAboutApiError(error);

    if (parsed.title) {
      setError("title", { type: "server", message: parsed.title });
    }

    if (parsed.script) {
      setError("script", { type: "server", message: parsed.script });
    }

    if (parsed.media) {
      setMediaError(parsed.media);
    }

    if (parsed.general) {
      toast.error(parsed.general);
    }
  };

  const onSubmit = (values: AboutUsSectionFormSubmitValues) => {
    setMediaError(null);
    clearErrors();

    const hasInvalidImage = media.some(
      (item) => item.kind === "image" && item.file && !isAllowedImageFile(item.file),
    );

    if (hasInvalidImage) {
      setMediaError(INVALID_IMAGE_TYPE_MESSAGE);
      return;
    }

    createSection.mutate(
      buildAboutFormData({
        title: values.title,
        script: values.script,
        media,
      }),
      { onError: handleApiError },
    );
  };

  return (
    <div className="flex min-h-full w-full flex-col pb-24 sm:pb-28">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/dashboard/about"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to About Us
        </Link>

        <h1 className="page-title mt-4">Add About Section</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new section for the about page.
        </p>
      </div>

      <form
        id="add-about-section-form"
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
              placeholder="Our Mission"
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="flex min-w-0 flex-col gap-2">
              <label
                htmlFor="about-script"
                className="text-sm font-medium text-foreground"
              >
                Script
              </label>
              <textarea
                id="about-script"
                rows={6}
                placeholder="We build meaningful digital experiences."
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

        <EntityMediaSection
          media={media}
          mainIndex={mainIndex}
          onAddFiles={addFiles}
          onRemoveAt={removeAt}
          onReorderMedia={reorderMedia}
          showMainBadge={false}
          error={mediaError ?? undefined}
          tipText="Optional images and videos for this about section. Drag to reorder."
        />
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-background/40 backdrop-blur-md transition-[left] duration-200 lg:left-[var(--dashboard-sidebar-offset)]">
        <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <Link
            href="/dashboard/about"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Cancel changes
          </Link>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <Link
              href="/dashboard/about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              Cancel
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
              <Button
                type="submit"
                form="add-about-section-form"
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
