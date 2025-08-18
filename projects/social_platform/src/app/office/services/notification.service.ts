/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject, map } from "rxjs";
import { Notification } from "@models/notification.model";

/**
 * Сервис для управления уведомлениями пользователя
 *
 * Предоставляет функциональность для:
 * - Хранения списка уведомлений в памяти
 * - Отслеживания количества непрочитанных уведомлений
 * - Реактивного обновления состояния уведомлений
 */
@Injectable({
  providedIn: "root",
})
export class NotificationService {
  constructor() {}

  /**
   * BehaviorSubject для хранения списка уведомлений
   * Позволяет компонентам подписываться на изменения списка уведомлений
   */
  notifications = new BehaviorSubject<Notification[]>([]);

  /**
   * Observable для отслеживания количества непрочитанных уведомлений
   * Автоматически пересчитывается при изменении списка уведомлений
   * Фильтрует уведомления по полю readAt (если null - уведомление не прочитано)
   *
   * @returns Observable<number> - количество непрочитанных уведомлений
   */
  hasNotifications = this.notifications
    .asObservable()
    .pipe(map(notifications => notifications.filter(notification => notification.readAt).length));
}
