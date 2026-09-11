/** @format */

import { inject, Injectable } from "@angular/core";
import { MarkAllNotificationsReadResult } from "@domain/notification/notification.model";
import { NotificationRepositoryPort } from "@domain/notification/ports/notification.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

export type MarkAllNotificationsReadError = {
  kind: "mark_all_notifications_read_error";
  cause: unknown;
};

/** Помечает все видимые PROD-уведомления текущего пользователя прочитанными. */
@Injectable({ providedIn: "root" })
export class MarkAllNotificationsReadUseCase {
  private readonly repository = inject(NotificationRepositoryPort);

  execute(): Observable<Result<MarkAllNotificationsReadResult, MarkAllNotificationsReadError>> {
    return this.repository.markAllRead().pipe(
      map(result => ok(result)),
      catchError(cause => of(fail({ kind: "mark_all_notifications_read_error" as const, cause }))),
    );
  }
}
