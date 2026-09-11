/** @format */

/**
 * DTO после общего CamelcaseInterceptor. Backend snake_case поля
 * action_url/read_at/created_at и actor first_name/last_name приходят сюда в camelCase.
 */
export interface NotificationActorDto {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface NotificationDto {
  id: number;
  type: string;
  category: string;
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
  actor: NotificationActorDto | null;
}

export interface NotificationPageDto {
  count: number;
  unreadCount: number;
  next: string | null;
  previous: string | null;
  results: NotificationDto[];
}

export interface NotificationUnreadCountDto {
  unreadCount: number;
}

export interface MarkAllNotificationsReadDto {
  updated: number;
  unreadCount: number;
}
