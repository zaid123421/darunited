import { serverFetch } from "@/shared/lib/api/server";
import type {
  MessageDetail,
  MessageListData,
  MessageListParams,
} from "@/modules/messages/types";

function buildQuery(params: MessageListParams) {
  const searchParams = new URLSearchParams();
  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const messagesApi = {
  list: (params?: MessageListParams) =>
    serverFetch<MessageListData>(
      `/admin/contact-messages${buildQuery(params ?? {})}`,
    ),

  getById: (id: number | string) =>
    serverFetch<MessageDetail>(`/admin/contact-messages/${id}`),
};
