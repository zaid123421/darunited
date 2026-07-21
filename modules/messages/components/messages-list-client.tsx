"use client";

import Link from "next/link";
import { formatMessageDate } from "@/modules/messages/lib/format-message-date";
import type { MessageListData } from "@/modules/messages/types";
import { Card } from "@/shared/components/ui/card";
import { MessageRow } from "@/modules/messages/components/message-row";
import { Pagination } from "@/shared/components/ui/pagination";

interface MessagesListClientProps {
  data: MessageListData;
}

export function MessagesListClient({ data }: MessagesListClientProps) {
  const { messages, pagination } = data;

  return (
    <div className="flex flex-col gap-6">
      <div>
          <h1 className="page-title">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Contact form submissions from the public website.
        </p>
      </div>

      {messages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-base font-medium text-foreground">No messages yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            New contact form submissions will appear here.
          </p>
        </Card>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border md:block">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <MessageRow key={message.id} message={message} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {messages.map((message) => (
              <Card key={message.id} className="flex flex-col gap-3 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{message.fullName}</p>
                  <p className="text-sm text-muted-foreground">{message.title}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {formatMessageDate(message.created_at)}
                  </p>
                  <Link
                    href={`/dashboard/messages/${message.id}`}
                    className="btn-brand inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs"
                  >
                    View
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            hasMore={pagination.has_more}
            basePath="/dashboard/messages"
            itemLabel="messages"
          />
        </>
      )}
    </div>
  );
}
