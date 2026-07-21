export interface MessagePaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface MessageListItem {
  id: number;
  fullName: string;
  title: string;
  created_at: string;
}

export interface MessageService {
  id: number | null;
  title: string | null;
  isDeleted: boolean;
}

export interface MessageDetail {
  id: number;
  fullName: string;
  email: string;
  title: string;
  script: string;
  created_at: string;
  service: MessageService;
}

export interface MessageListData {
  messages: MessageListItem[];
  pagination: MessagePaginationMeta;
}

export interface MessageListParams {
  page?: number;
}
