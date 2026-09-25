"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useGalleryEdit } from "@/modules/media/hooks/use-gallery-edit";
import { EntityMainPicSection } from "@/modules/media/components/entity-main-pic-section";
import { EntityMediaSection } from "@/modules/media/components/entity-media-section";
import { useUpdateProduct } from "@/modules/products/hooks/use-update-product";
import { ProductSubcategoryPicker } from "@/modules/products/components/product-subcategory-picker";
import {
  getGalleryFromProduct,
  getMainPicFromProduct,
} from "@/modules/products/lib/product-media-mappers";
import { parseProductApiError } from "@/modules/products/lib/parse-product-api-error";
import {
  productFormSchema,
  type ProductFormSubmitValues,
  type ProductFormValues,
} from "@/modules/products/schemas/product.schema";
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  isAllowedImageFile,
} from "@/modules/media/lib/media-file-validation";
import type {
  CategoryOption,
  MainPicAction,
  ProductDetail,
  SubCategoryOption,
} from "@/modules/products/types";
import { Button } from "@/shared/components/ui/button";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Select } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";
import { ApiError } from "@/shared/types/global-response";

interface EditProductPageProps {
  product: ProductDetail;
  categories: CategoryOption[];
  subCategories: SubCategoryOption[];
}

function sameIds(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((v, i) => v === sortedB[i]);
}

export function EditProductPage({
  product,
  categories,
  subCategories,
}: EditProductPageProps) {
  const initialMainPic = getMainPicFromProduct(product);
  const initialGallery = useMemo(() => getGalleryFromProduct(product), [product]);
  const initialSubCategoryIds = useMemo(
    () => product.subCategories?.map((sc) => sc.id) ?? [],
    [product],
  );
  const initialCategoryId = product.category?.id ?? 0;

  const updateProduct = useUpdateProduct();

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, ProductFormSubmitValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: product.title,
      description: product.description ?? "",
      categoryId: initialCategoryId,
      subCategoryIds: initialSubCategoryIds,
    },
  });

  const description = watch("description");
  const title = watch("title");
  const categoryId = watch("categoryId") as number;
  const subCategoryIds = (watch("subCategoryIds") as number[]) ?? [];

  const categoryOptions = categories.map((cat) => ({
    label: cat.title,
    value: String(cat.id),
  }));

  useEffect(() => {
    resetGallery(initialGallery);
    setMainPicPreview(initialMainPic?.url ?? null);
    setMainPicFile(null);
    setMainPicRemoved(false);
    setMainPicError(null);
    setMediaError(null);
  }, [initialGallery, initialMainPic?.url, resetGallery, product.id]);

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
    title.trim() !== product.title.trim() ||
    (description?.trim() || "") !== (product.description?.trim() || "") ||
    !sameIds(subCategoryIds, initialSubCategoryIds);

  const hasChanges = hasInfoChanges || hasMainPicChanges || galleryChanged;

  const resolveMainPicAction = (): MainPicAction => {
    if (mainPicFile) return "upload";
    if (initialMainPic && mainPicRemoved) return "delete";
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
  };

  const handleMainPicRemove = () => {
    if (mainPicPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(mainPicPreview);
    }

    setMainPicPreview(null);
    setMainPicFile(null);
    setMainPicRemoved(true);
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

    const parsed = parseProductApiError(error);

    if (parsed.title) {
      setError("title", { type: "server", message: parsed.title });
    }

    if (parsed.description) {
      setError("description", { type: "server", message: parsed.description });
    }

    if (parsed.subCategoryIds) {
      setError("subCategoryIds", { type: "server", message: parsed.subCategoryIds });
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

  const onSubmit = (values: ProductFormSubmitValues) => {
    setMediaError(null);
    setMainPicError(null);
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

    updateProduct.mutate(
      {
        id: product.id,
        title: values.title,
        description: values.description,
        subCategoryIds: values.subCategoryIds,
        initialTitle: product.title,
        initialDescription: product.description ?? "",
        initialSubCategoryIds,
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

  // Derive error message for subCategoryIds
  const subCategoryError =
    (errors.subCategoryIds as unknown as { message?: string } | undefined)?.message ??
    (errors.subCategoryIds as unknown as { root?: { message?: string } } | undefined)?.root
      ?.message;

  return (
    <div className="flex min-h-full w-full flex-col pb-24 sm:pb-28">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <h1 className="page-title mt-4">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update product details and media</p>
      </div>

      <form
        id="edit-product-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <Card className="p-4 sm:p-6">
          <CardTitle className="mb-4 text-sm font-semibold sm:mb-6 sm:text-base">
            Product Information
          </CardTitle>

          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="product-title"
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Product Title
              </label>
              <Input
                id="product-title"
                placeholder="e.g. Professional Web Design"
                className="h-12 rounded-xl bg-input"
                error={errors.title?.message}
                {...register("title")}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="product-description"
                className="text-sm font-medium text-muted-foreground"
              >
                Description
              </label>
              <textarea
                id="product-description"
                rows={5}
                placeholder="Describe this product..."
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
                <p className="text-xs text-destructive">{errors.description.message}</p>
              ) : null}
            </div>

            {/* Category */}
            <Select
              label="Category"
              placeholder="Select a category"
              options={categoryOptions}
              value={categoryId > 0 ? String(categoryId) : ""}
              onValueChange={(value) => {
                setValue("categoryId", Number(value), { shouldValidate: true });
                setValue("subCategoryIds", [], { shouldValidate: false });
              }}
              error={
                (errors.categoryId as unknown as { message?: string } | undefined)?.message
              }
            />

            {/* Subcategories */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Subcategories <span className="text-destructive">*</span>
              </label>
              <ProductSubcategoryPicker
                subCategories={subCategories}
                selectedCategoryId={categoryId ?? 0}
                selectedIds={subCategoryIds}
                onChange={(ids) =>
                  setValue("subCategoryIds", ids, { shouldValidate: true })
                }
                error={subCategoryError}
              />
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
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-background/40 backdrop-blur-md lg:left-[260px]">
        <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <Link
            href="/dashboard/products"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Cancel changes
          </Link>

          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <Link
              href="/dashboard/products"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
            >
              Cancel
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:ml-0 sm:gap-3">
              <Button
                type="submit"
                form="edit-product-form"
                disabled={updateProduct.isPending || !hasChanges}
                className={cn(
                  "h-9 flex-1 rounded-lg border border-white/15 px-3 text-xs sm:h-10 sm:flex-none sm:px-5 sm:text-sm",
                  updateProduct.isPending && "opacity-70",
                )}
              >
                {updateProduct.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
