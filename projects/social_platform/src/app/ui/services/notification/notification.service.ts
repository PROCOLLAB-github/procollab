/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject, map } from "rxjs";
import { Notification } from "@domain/other/notification.model";

/** Сервис для управления уведомлениями пользователя. */
@Injectable({
  providedIn: "root",
})
export class NotificationService {
  constructor() {}

  notifications = new BehaviorSubject<Notification[]>([]);

  hasNotifications = this.notifications
    .asObservable()
    .pipe(map(notifications => notifications.filter(notification => !notification.readAt).length));
}
