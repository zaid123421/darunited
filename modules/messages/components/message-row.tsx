import Link from "next/link";
import { formatMessageDate } from "@/modules/messages/lib/format-message-date";
import type { MessageListItem } from "@/modules/messages/types";

interface MessageRowProps {
  message: MessageListItem;
}

export function MessageRow({ message }: MessageRowProps) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm font-medium text-foreground">
        {message.fullName}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{message.title}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatMessageDate(message.created_at)}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/dashboard/messages/${message.id}`}
          className="btn-brand inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs"
        >
          View
        </Link>
      </td>
    </tr>
  );
}
