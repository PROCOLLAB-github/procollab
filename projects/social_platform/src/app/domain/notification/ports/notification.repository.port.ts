/** @format */

import { Observable } from "rxjs";
import {
  GetNotificationsQuery,
  MarkAllNotificationsReadResult,
  Notification,
  NotificationPage,
} from "../notification.model";

/** Порт production Notification API для Angular Office shell. */
export abstract class NotificationRepositoryPort {
  abstract getNotifications(query: GetNotificationsQuery): Observable<NotificationPage>;
  abstract getUnreadCount(): Observable<number>;
  abstract markRead(notificationId: number): Observable<Notification>;
  abstract markAllRead(): Observable<MarkAllNotificationsReadResult>;
}
