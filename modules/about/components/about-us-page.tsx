"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useSaveAboutUs } from "@/modules/about/hooks/use-save-about-us";
import { mapAboutSectionsToForm } from "@/modules/about/lib/map-about-sections-to-form";
import { parseAboutApiError } from "@/modules/about/lib/parse-about-api-error";
import {
  aboutUsFormSchema,
  aboutUsSyncSchema,
  type AboutUsFormValues,
} from "@/modules/about/schemas/about.schema";
import type { AboutUsSection } from "@/modules/about/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { FeedbackBanner } from "@/shared/components/ui/feedback-banner";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

interface AboutUsPageProps {
  sections: AboutUsSection[];
}

type FeedbackState = {
  type: "success" | "error";
  message: string;
};

type SectionToDelete = {
  index: number;
  title: string;
};

const addSectionButtonClass =
  "btn-brand inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm sm:w-auto";

function ensureAtLeastOneSection(values: AboutUsFormValues): AboutUsFormValues {
  if (values.sections.length > 0) {
    return values;
  }

  return {
    sections: [{ title: "", script: "", isNew: true }],
  };
}

export function AboutUsPage({ sections }: AboutUsPageProps) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<SectionToDelete | null>(null);

  const saveAboutUs = useSaveAboutUs({
    onSuccess: (message) => {
      setGeneralError(null);
      setFeedback({
        type: "success",
        message: message || "About us sections saved successfully.",
      });
    },
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<AboutUsFormValues>({
    resolver: zodResolver(aboutUsFormSchema),
    defaultValues: ensureAtLeastOneSection(mapAboutSectionsToForm(sections)),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    reset(ensureAtLeastOneSection(mapAboutSectionsToForm(sections)));
  }, [sections, reset]);

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

    const parsed = parseAboutApiError(error);

    if (parsed.sections) {
      for (const [index, fieldError] of Object.entries(parsed.sections)) {
        if (fieldError.title) {
          setError(`sections.${Number(index)}.title`, {
            type: "server",
            message: fieldError.title,
          });
        }

        if (fieldError.script) {
          setError(`sections.${Number(index)}.script`, {
            type: "server",
            message: fieldError.script,
          });
        }
      }
    }

    if (parsed.general) {
      setGeneralError(parsed.general);
    }
  };

  const onSubmit = (values: AboutUsFormValues) => {
    setGeneralError(null);
    setFeedback(null);
    clearErrors();

    const payload = {
      sections: values.sections.map((section) => ({
        ...(section.id != null ? { id: section.id } : {}),
        title: section.title.trim(),
        script: section.script.trim(),
      })),
    };

    const parsed = aboutUsSyncSchema.safeParse(payload);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "sections" && typeof issue.path[1] === "number") {
          const index = issue.path[1];
          const field = issue.path[2];

          if (field === "title" || field === "script") {
            setError(`sections.${index}.${field}`, {
              type: "manual",
              message: issue.message,
            });
          }
        }

        if (issue.path[0] === "sections" && issue.path.length === 1) {
          setGeneralError(issue.message);
        }
      }

      return;
    }

    saveAboutUs.mutate(parsed.data, { onError: handleApiError });
  };

  const handleAddSection = () => {
    append({ title: "", script: "", isNew: true });
  };

  const handleDeleteConfirm = () => {
    if (sectionToDelete === null) {
      return;
    }

    remove(sectionToDelete.index);
    setSectionToDelete(null);
  };

  const deleteDialogTitle = sectionToDelete?.title.trim()
    ? `"${sectionToDelete.title.trim()}"`
    : "this section";

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">About Us</h1>
          <p className="page-subtitle mt-1">
            Edit sections displayed on the about page.
          </p>
        </div>
        <button
          type="button"
          className={addSectionButtonClass}
          onClick={handleAddSection}
        >
          Add Section
        </button>
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
        {fields.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-base font-medium text-foreground">No sections yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add your first about us section to get started.
            </p>
            <button
              type="button"
              className={`mt-2 ${addSectionButtonClass}`}
              onClick={handleAddSection}
            >
              Add Section
            </button>
          </Card>
        ) : (
          <div className="grid w-full min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            {fields.map((field, index) => {
              const isNew = Boolean(field.isNew);

              return (
                <Card key={field.id} className="flex min-w-0 flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>
                        {isNew ? "New Section" : `Section ${index + 1}`}
                      </CardTitle>
                      <CardDescription>
                        {isNew
                          ? "New section — save to publish changes."
                          : "Changes are saved when you click Save below."}
                      </CardDescription>
                    </div>
                    {fields.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() =>
                          setSectionToDelete({
                            index,
                            title: watch(`sections.${index}.title`),
                          })
                        }
                        aria-label={`Delete section ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>

                  <Input
                    label="Title"
                    placeholder="Our Mission"
                    error={errors.sections?.[index]?.title?.message}
                    {...register(`sections.${index}.title`)}
                  />

                  <div className="flex min-w-0 flex-col gap-2">
                    <label
                      htmlFor={`section-script-${index}`}
                      className="text-sm font-medium text-foreground"
                    >
                      Script
                    </label>
                    <textarea
                      id={`section-script-${index}`}
                      rows={5}
                      placeholder="We build meaningful digital experiences."
                      className={cn(
                        "min-h-[120px] w-full max-w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60",
                        inputFocusRingClass,
                        errors.sections?.[index]?.script &&
                          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive",
                      )}
                      value={watch(`sections.${index}.script`)}
                      onChange={(event) =>
                        setValue(`sections.${index}.script`, event.target.value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    {errors.sections?.[index]?.script?.message ? (
                      <p className="flex items-center gap-1 text-xs text-destructive">
                        <span>⚠</span> {errors.sections[index]?.script?.message}
                      </p>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={saveAboutUs.isPending}
          >
            {saveAboutUs.isPending ? "Saving..." : "Save About Us"}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={sectionToDelete !== null}
        title="Delete section"
        description={`Are you sure you want to remove ${deleteDialogTitle} from the sections list? Save to apply changes.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSectionToDelete(null)}
      />
    </div>
  );
}
