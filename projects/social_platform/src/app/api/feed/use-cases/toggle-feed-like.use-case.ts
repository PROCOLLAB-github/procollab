/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import {
  PROFILE_NEWS_REPOSITORY,
  PROJECT_NEWS_REPOSITORY,
} from "@domain/news/port/news.repository.port";

/** Сценарий: переключить лайк новости ленты у её владельца; ошибка → `toggle_feed_like_error`. */
@Injectable({ providedIn: "root" })
export class ToggleFeedLikeUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);
  private readonly profileNewsRepositoryPort = inject(PROFILE_NEWS_REPOSITORY);

  execute(
    ownerType: "project" | "profile",
    ownerId: string,
    newsId: number,
    state: boolean
  ): Observable<Result<void, { kind: "toggle_feed_like_error"; cause?: unknown }>> {
    const request$ =
      ownerType === "profile"
        ? this.profileNewsRepositoryPort.toggleLike(ownerId, newsId, state)
        : this.projectNewsRepositoryPort.toggleLike(ownerId, newsId, state);

    return request$.pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "toggle_feed_like_error" as const, cause: error })))
    );
  }
}
