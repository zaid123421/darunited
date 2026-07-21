"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import type { ServiceProject } from "@/modules/services/types";
import { formatProjectDate } from "@/modules/services/lib/format-project-date";

interface ServiceProjectCardProps {
  project: ServiceProject;
}

export function ServiceProjectCard({ project }: ServiceProjectCardProps) {
  const hasImage = Boolean(project.mainPic);

  return (
    <article className="group card-lift overflow-hidden rounded-2xl border border-border bg-card">
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="relative block aspect-[4/3] overflow-hidden"
        aria-label={`View ${project.title}`}
      >
        {hasImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${project.mainPic})` }}
            role="img"
            aria-label={project.title}
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
            {project.title}
          </h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-white/80">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <time dateTime={project.actualProjectDate}>
              {formatProjectDate(project.actualProjectDate)}
            </time>
          </p>
        </div>
      </Link>
    </article>
  );
}
