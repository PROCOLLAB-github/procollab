/** @format */

import { Provider } from "@angular/core";
import { NotificationRepositoryPort } from "@domain/notification/ports/notification.repository.port";
import { NotificationRepository } from "../repository/notification/notification.repository";

export const NOTIFICATION_PROVIDERS: Provider[] = [
  { provide: NotificationRepositoryPort, useExisting: NotificationRepository },
];
