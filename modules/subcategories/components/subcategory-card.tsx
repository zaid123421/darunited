"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import type { Subcategory } from "@/modules/subcategories/types";
import { cn } from "@/shared/lib/cn";

interface SubcategoryCardProps {
  subcategory: Subcategory;
  onDelete: () => void;
}

export function SubcategoryCard({ subcategory, onDelete }: SubcategoryCardProps) {
  const { canWrite } = usePermissions();
  const hasImage = Boolean(subcategory.pic);

  return (
    <article className="group card-lift overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link
          href={`/dashboard/subcategories/${subcategory.id}`}
          className="absolute inset-0 block"
          aria-label={`View ${subcategory.title}`}
        >
          {hasImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${subcategory.pic})` }}
              role="img"
              aria-label={subcategory.title}
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/35 via-accent/20 to-background"
              aria-hidden
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">
              {subcategory.title}
            </h3>
          </div>
        </Link>

        {canWrite ? (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <Link
              href={`/dashboard/subcategories/${subcategory.id}/edit`}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15",
                "bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-primary hover:text-primary",
              )}
              aria-label={`Edit ${subcategory.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15",
                "bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-primary hover:text-primary",
              )}
              aria-label={`Delete ${subcategory.title}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
