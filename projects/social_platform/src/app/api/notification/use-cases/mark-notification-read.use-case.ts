/** @format */

import { inject, Injectable } from "@angular/core";
import { Notification } from "@domain/notification/notification.model";
import { NotificationRepositoryPort } from "@domain/notification/ports/notification.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

export type MarkNotificationReadError = {
  kind: "mark_notification_read_error";
  cause: unknown;
};

/** Помечает одно принадлежащее пользователю уведомление прочитанным. */
@Injectable({ providedIn: "root" })
export class MarkNotificationReadUseCase {
  private readonly repository = inject(NotificationRepositoryPort);

  execute(notificationId: number): Observable<Result<Notification, MarkNotificationReadError>> {
    return this.repository.markRead(notificationId).pipe(
      map(notification => ok(notification)),
      catchError(cause => of(fail({ kind: "mark_notification_read_error" as const, cause }))),
    );
  }
}
