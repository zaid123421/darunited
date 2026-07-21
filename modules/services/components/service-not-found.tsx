import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/cn";

export function ServiceNotFound() {
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
      </div>

      <Card className="mx-auto flex w-full max-w-lg flex-col items-center px-6 py-12 text-center sm:px-8 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          404
        </p>
        <h1 className="page-title mt-3">
          Service not found
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          This service may have been deleted or the link is incorrect.
        </p>
        <Link
          href="/dashboard/services"
          className={cn(buttonVariants(), "mt-8 h-10 rounded-lg px-5")}
        >
          Back to Services
        </Link>
      </Card>
    </div>
  );
}
