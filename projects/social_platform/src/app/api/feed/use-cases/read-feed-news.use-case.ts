/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import {
  PROFILE_NEWS_REPOSITORY,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

/** Сценарий: отметить новости ленты просмотренными у их владельца; ошибка → `read_feed_news_error`. */
@Injectable({ providedIn: "root" })
export class ReadFeedNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);
  private readonly profileNewsRepositoryPort = inject(PROFILE_NEWS_REPOSITORY);

  execute(
    ownerType: "project" | "profile",
    ownerId: number,
    newsIds: number[]
  ): Observable<Result<void[], { kind: "read_feed_news_error"; cause?: unknown }>> {
    const request$ =
      ownerType === "profile"
        ? this.profileNewsRepositoryPort.readNews(ownerId, newsIds)
        : this.projectNewsRepositoryPort.readNews(ownerId, newsIds);

    return request$.pipe(
      map(result => ok<void[]>(result)),
      catchError(error => of(fail({ kind: "read_feed_news_error" as const, cause: error })))
    );
  }
}
