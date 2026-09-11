/** @format */

import { inject, Injectable } from "@angular/core";
import { NotificationRepositoryPort } from "@domain/notification/ports/notification.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

export type GetNotificationUnreadCountError = {
  kind: "get_notification_unread_count_error";
  cause: unknown;
};

/** Получает только badge count без polling полного списка. */
@Injectable({ providedIn: "root" })
export class GetNotificationUnreadCountUseCase {
  private readonly repository = inject(NotificationRepositoryPort);

  execute(): Observable<Result<number, GetNotificationUnreadCountError>> {
    return this.repository.getUnreadCount().pipe(
      map(count => ok(count)),
      catchError(cause =>
        of(fail({ kind: "get_notification_unread_count_error" as const, cause })),
      ),
    );
  }
}
