/** @format */

import { inject, Injectable } from "@angular/core";
import { GetNotificationsQuery, NotificationPage } from "@domain/notification/notification.model";
import { NotificationRepositoryPort } from "@domain/notification/ports/notification.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

export type GetNotificationsError = { kind: "get_notifications_error"; cause: unknown };

/** Загружает одну limit/offset страницу уведомлений. */
@Injectable({ providedIn: "root" })
export class GetNotificationsUseCase {
  private readonly repository = inject(NotificationRepositoryPort);

  execute(
    query: GetNotificationsQuery,
  ): Observable<Result<NotificationPage, GetNotificationsError>> {
    return this.repository.getNotifications(query).pipe(
      map(page => ok(page)),
      catchError(cause => of(fail({ kind: "get_notifications_error" as const, cause }))),
    );
  }
}
