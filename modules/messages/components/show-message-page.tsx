"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { formatMessageDate } from "@/modules/messages/lib/format-message-date";
import type { MessageDetail } from "@/modules/messages/types";
import { Card, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/cn";
import { inputFocusRingClass } from "@/shared/lib/input-focus";

interface ShowMessagePageProps {
  message: MessageDetail;
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function getServiceLabel(message: MessageDetail) {
  if (message.service.isDeleted) {
    return message.service.title
      ? `${message.service.title} (deleted)`
      : "Deleted service";
  }

  if (message.service.title) {
    return message.service.title;
  }

  return "—";
}

export function ShowMessagePage({ message }: ShowMessagePageProps) {
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
          {message.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Submitted on {formatMessageDate(message.created_at)}
        </p>
      </div>

      <Card>
        <CardTitle className="mb-5">Message Details</CardTitle>

        <div className="grid gap-4 md:grid-cols-2">
          <DetailField label="Full Name" value={message.fullName} />
          <DetailField label="Email" value={message.email} />
          <DetailField label="Title" value={message.title} />
          <DetailField
            label="Service"
            value={
              <span
                className={cn(
                  message.service.isDeleted && "text-destructive",
                )}
              >
                {getServiceLabel(message)}
              </span>
            }
          />
          <DetailField
            label="Date"
            value={formatMessageDate(message.created_at)}
            className="md:col-span-2"
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Message</label>
          <textarea
            readOnly
            rows={6}
            value={message.script}
            className={cn(
              "min-h-[140px] w-full resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground",
              inputFocusRingClass,
            )}
          />
        </div>
      </Card>
    </div>
  );
}
