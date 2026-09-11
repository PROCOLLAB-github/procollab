/** @format */

import { inject, Injectable } from "@angular/core";
import {
  GetNotificationsQuery,
  MarkAllNotificationsReadResult,
  Notification,
  NotificationPage,
} from "@domain/notification/notification.model";
import { NotificationRepositoryPort } from "@domain/notification/ports/notification.repository.port";
import { map, Observable } from "rxjs";
import { NotificationDto } from "../../adapters/notification/dto/notification.dto";
import { NotificationHttpAdapter } from "../../adapters/notification/notification-http.adapter";

function notificationFromDto(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    type: dto.type,
    category: dto.category,
    title: dto.title,
    message: dto.message,
    actionUrl: dto.actionUrl,
    readAt: dto.readAt,
    createdAt: dto.createdAt,
    actor: dto.actor
      ? {
          id: dto.actor.id,
          firstName: dto.actor.firstName,
          lastName: dto.actor.lastName,
          avatar: dto.actor.avatar,
        }
      : null,
  };
}

/** Repository мапит transport DTO в независимую UI-domain модель. */
@Injectable({ providedIn: "root" })
export class NotificationRepository implements NotificationRepositoryPort {
  private readonly adapter = inject(NotificationHttpAdapter);

  getNotifications(query: GetNotificationsQuery): Observable<NotificationPage> {
    return this.adapter.getNotifications(query).pipe(
      map(page => ({
        count: page.count,
        unreadCount: page.unreadCount,
        next: page.next,
        previous: page.previous,
        results: page.results.map(notificationFromDto),
      })),
    );
  }

  getUnreadCount(): Observable<number> {
    return this.adapter.getUnreadCount().pipe(map(response => response.unreadCount));
  }

  markRead(notificationId: number): Observable<Notification> {
    return this.adapter.markRead(notificationId).pipe(map(notificationFromDto));
  }

  markAllRead(): Observable<MarkAllNotificationsReadResult> {
    return this.adapter.markAllRead().pipe(
      map(response => ({
        updated: response.updated,
        unreadCount: response.unreadCount,
      })),
    );
  }
}
