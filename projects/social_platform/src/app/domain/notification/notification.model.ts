/** @format */

export const KNOWN_NOTIFICATION_TYPES = [
  "project_invite_created",
  "project_invite_accepted",
  "project_invite_declined",
  "project_invite_revoked",
  "vacancy_response_created",
  "vacancy_response_accepted",
  "vacancy_response_declined",
  "program_news_published",
  "program_material_published",
  "course_access_opened",
] as const;

export type KnownNotificationType = (typeof KNOWN_NOTIFICATION_TYPES)[number];

/** Известные PROD-типы с безопасным fallback для будущих backend-событий. */
export type NotificationType = KnownNotificationType | (string & Record<never, never>);

export const KNOWN_NOTIFICATION_CATEGORIES = [
  "project",
  "vacancy",
  "program",
  "expert",
  "news",
  "system",
] as const;

export type KnownNotificationCategory = (typeof KNOWN_NOTIFICATION_CATEGORIES)[number];
export type NotificationCategory = KnownNotificationCategory | (string & Record<never, never>);

export interface NotificationActor {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

/** UI-domain уведомления. Snake_case остаётся внутри HTTP boundary/interceptor. */
export interface Notification {
  id: number;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
  actor: NotificationActor | null;
}

export interface NotificationPage {
  count: number;
  unreadCount: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface GetNotificationsQuery {
  limit: number;
  offset: number;
  unread?: boolean;
}

export interface MarkAllNotificationsReadResult {
  updated: number;
  unreadCount: number;
}
