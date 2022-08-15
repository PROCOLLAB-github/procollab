/** @format */

import { Injectable } from "@angular/core";
import { BehaviorSubject, map } from "rxjs";
import { Notification } from "../models/notification.model";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  constructor() {}

  notifications = new BehaviorSubject<Notification[]>([]);
  hasNotifications = this.notifications
    .asObservable()
    .pipe(map(notifications => notifications.filter(notification => notification.readAt).length));
}
