/** @format */

import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { GetNotificationsQuery } from "@domain/notification/notification.model";
import { Observable } from "rxjs";
import {
  MarkAllNotificationsReadDto,
  NotificationDto,
  NotificationPageDto,
  NotificationUnreadCountDto,
} from "./dto/notification.dto";

/** HTTP boundary официального Angular Notification API. */
@Injectable({ providedIn: "root" })
export class NotificationHttpAdapter {
  private readonly apiService = inject(ApiService);
  private readonly notificationsUrl = "/notifications";

  getNotifications(query: GetNotificationsQuery): Observable<NotificationPageDto> {
    let params = new HttpParams().set("limit", query.limit).set("offset", query.offset);
    if (query.unread !== undefined) {
      params = params.set("unread", query.unread);
    }

    return this.apiService.get<NotificationPageDto>(`${this.notificationsUrl}/`, params);
  }

  getUnreadCount(): Observable<NotificationUnreadCountDto> {
    return this.apiService.get<NotificationUnreadCountDto>(
      `${this.notificationsUrl}/unread-count/`,
    );
  }

  markRead(notificationId: number): Observable<NotificationDto> {
    return this.apiService.post<NotificationDto>(
      `${this.notificationsUrl}/${notificationId}/read/`,
      {},
    );
  }

  markAllRead(): Observable<MarkAllNotificationsReadDto> {
    return this.apiService.post<MarkAllNotificationsReadDto>(
      `${this.notificationsUrl}/read-all/`,
      {},
    );
  }
}
