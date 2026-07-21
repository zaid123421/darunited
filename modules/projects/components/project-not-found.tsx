import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/shared/components/ui/card";

export function ProjectNotFound() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <h1 className="page-title mt-4">
          Project Not Found
        </h1>
        <p className="text-sm text-muted-foreground">
          The project you are looking for does not exist or may have been removed.
        </p>
      </div>
      <Card className="border-destructive/30 bg-destructive/5">
        <p className="text-sm text-destructive">
          Not found. Return to the projects list to continue.
        </p>
      </Card>
    </div>
  );
}
