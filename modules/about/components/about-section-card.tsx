"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { usePermissions } from "@/modules/auth/hooks/use-permissions";
import { getAboutSectionThumbnail } from "@/modules/about/lib/about-media-mappers";
import type { AboutUsSection } from "@/modules/about/types";
import { cn } from "@/shared/lib/cn";

interface AboutSectionCardProps {
  section: AboutUsSection;
  onDelete: () => void;
}

export function AboutSectionCard({ section, onDelete }: AboutSectionCardProps) {
  const { canWrite } = usePermissions();
  const thumbnail = getAboutSectionThumbnail(section);

  return (
    <article className="group card-lift overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link
          href={`/dashboard/about/${section.id}/edit`}
          className="absolute inset-0 block"
          aria-label={`Edit ${section.title}`}
        >
          {thumbnail ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url(${thumbnail})` }}
              role="img"
              aria-label={section.title}
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
              {section.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-white/75">{section.script}</p>
          </div>
        </Link>

        {canWrite ? (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <Link
              href={`/dashboard/about/${section.id}/edit`}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15",
                "bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-primary hover:text-primary",
              )}
              aria-label={`Edit ${section.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15",
                "bg-black/45 text-white backdrop-blur-sm transition-colors hover:border-primary hover:text-primary",
              )}
              aria-label={`Delete ${section.title}`}
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
