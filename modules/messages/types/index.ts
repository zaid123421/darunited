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

export interface MessageProduct {
  id: number | null;
  title: string | null;
  isOther: boolean;
  isDeleted: boolean;
}

export interface MessageDetail {
  id: number;
  fullName: string;
  email: string;
  country: string | null;
  title: string;
  script: string;
  created_at: string;
  product: MessageProduct | null;
}

export interface MessageListData {
  messages: MessageListItem[];
  pagination: MessagePaginationMeta;
}

export interface MessageListParams {
  page?: number;
}
