/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROFILE_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: переключить лайк новости профиля; ошибка → `toggle_profile_news_like_error`. */
@Injectable({ providedIn: "root" })
export class ToggleProfileNewsLikeUseCase {
  private readonly profileNewsRepositoryPort = inject(PROFILE_NEWS_REPOSITORY);

  execute(
    userId: string,
    newsId: number,
    state: boolean,
  ): Observable<Result<void, { kind: "toggle_profile_news_like_error"; cause?: unknown }>> {
    return this.profileNewsRepositoryPort.toggleLike(userId, newsId, state).pipe(
      map(() => ok<void>(undefined)),
      catchError(error =>
        of(fail({ kind: "toggle_profile_news_like_error" as const, cause: error })),
      ),
    );
  }
}
