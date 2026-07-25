// Types for in-app notifications and their paginated responses.
import type { LocalizedText } from '@/features/sell';

// A single notification.
export interface AppNotification {
  // Stable id.
  id: string | number;
  // Machine type, e.g. "VERIFICATION".
  type?: string;
  // Bilingual (or plain) title.
  title?: LocalizedText | string | null;
  // Bilingual (or plain) body.
  body?: LocalizedText | string | null;
  // Whether the user has read it.
  isRead?: boolean;
  // Deep-link target type, e.g. "BUSINESS_PROFILE" / "LISTING".
  refType?: string | null;
  // Deep-link target id.
  refId?: string | number | null;
  // Creation timestamp (ISO 8601).
  createdAt?: string;
}

// A Spring-style page of notifications.
export interface NotificationPage {
  // Notifications on the current page.
  content: AppNotification[];
  // Total number of pages.
  totalPages: number;
  // Zero-based current page index.
  number?: number;
  // Reported current page (some responses use `page`).
  page?: number;
  // Whether this is the last page.
  last: boolean;
}

// Unread-count response.
export interface UnreadCount {
  // Number of unread notifications.
  count: number;
}
