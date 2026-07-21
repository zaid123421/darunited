import { MessagesListClient } from "@/modules/messages/components/messages-list-client";
import type { MessageListData } from "@/modules/messages/types";

interface MessagesListPageProps {
  data: MessageListData;
}

export function MessagesListPage({ data }: MessagesListPageProps) {
  return <MessagesListClient data={data} />;
}
