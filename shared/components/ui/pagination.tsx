import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  from: number | null;
  to: number | null;
  hasMore: boolean;
  basePath: string;
  itemLabel?: string;
  pageParam?: string;
}

function buildPageHref(basePath: string, page: number, pageParam = "page") {
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}${pageParam}=${page}`;
}

function getVisiblePages(currentPage: number, lastPage: number) {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, lastPage, currentPage]);

  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < lastPage) pages.add(currentPage + 1);

  return Array.from(pages).sort((a, b) => a - b);
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  from,
  to,
  hasMore,
  basePath,
  itemLabel = "items",
  pageParam = "page",
}: PaginationProps) {
  if (lastPage <= 1) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? `No ${itemLabel} found`
            : `Showing ${from ?? 0}–${to ?? 0} of ${total} ${itemLabel}`}
        </p>
      </div>
    );
  }

  const visiblePages = getVisiblePages(currentPage, lastPage);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from ?? 0}–{to ?? 0} of {total} {itemLabel}
      </p>

      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center gap-1.5 sm:justify-end"
      >
        {currentPage > 1 ? (
          <Link
            href={buildPageHref(basePath, currentPage - 1, pageParam)}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-lg border border-border bg-card/50 px-3 text-sm font-medium text-muted-foreground opacity-50">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}

        <div className="hidden items-center gap-1 sm:flex">
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1];
            const showEllipsis = previousPage !== undefined && page - previousPage > 1;

            return (
              <span key={page} className="flex items-center gap-1">
                {showEllipsis ? (
                  <span className="px-1 text-sm text-muted-foreground">…</span>
                ) : null}
                <Link
                  href={buildPageHref(basePath, page, pageParam)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors",
                    page === currentPage
                      ? "btn-brand-outline border-primary"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  {page}
                </Link>
              </span>
            );
          })}
        </div>

        <span className="inline-flex h-9 items-center rounded-lg border border-border bg-muted px-3 text-sm font-medium text-muted-foreground sm:hidden">
          {currentPage} / {lastPage}
        </span>

        {hasMore ? (
          <Link
            href={buildPageHref(basePath, currentPage + 1, pageParam)}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-lg border border-border bg-card/50 px-3 text-sm font-medium text-muted-foreground opacity-50">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>
    </div>
  );
}
