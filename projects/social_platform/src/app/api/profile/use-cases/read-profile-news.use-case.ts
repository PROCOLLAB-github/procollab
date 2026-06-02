/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROFILE_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: отметить новости профиля просмотренными (с дедупликацией в storage). */
@Injectable({ providedIn: "root" })
export class ReadProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(PROFILE_NEWS_REPOSITORY);

  execute(
    userId: number,
    newsIds: number[],
  ): Observable<Result<void[], { kind: "read_profile_news_error"; cause?: unknown }>> {
    return this.profileNewsRepositoryPort.readNews(userId, newsIds).pipe(
      map(result => ok<void[]>(result)),
      catchError(error => of(fail({ kind: "read_profile_news_error" as const, cause: error }))),
    );
  }
}
