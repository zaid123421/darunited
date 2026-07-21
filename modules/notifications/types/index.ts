export type NotificationType =
  | "contact_message"
  | "business_form_submission"
  | (string & {});

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  page: string | null;
  clickable: boolean;
  requestedId: string | null;
  extraData: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface NotificationListData {
  notifications: NotificationItem[];
  pagination: NotificationPaginationMeta;
}

export interface NotificationUnreadCountData {
  count: number;
}

export interface RegisterFirebaseTokenPayload {
  token: string;
  platform?: string;
  deviceName?: string;
}

export interface DeleteFirebaseTokenPayload {
  token: string;
}

export interface FirebaseMessagePayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: {
    notificationId?: string;
    type?: string;
    page?: string;
    clickable?: string;
    requestedId?: string;
    extraData?: string;
  };
}
