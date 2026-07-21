import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/shared/components/ui/card";

export function MessageNotFound() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/messages"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Messages
        </Link>
        <h1 className="page-title mt-4">
          Message Not Found
        </h1>
        <p className="text-sm text-muted-foreground">
          The message you are looking for does not exist or may have been removed.
        </p>
      </div>
      <Card className="border-destructive/30 bg-destructive/5">
        <p className="text-sm text-destructive">
          Not found. Return to the messages list to continue.
        </p>
      </Card>
    </div>
  );
}
