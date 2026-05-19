/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: переключить лайк новости проекта (возвращает newsId); ошибка → `toggle_project_news_like_error`. */
@Injectable({ providedIn: "root" })
export class ToggleProjectNewsLikeUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);

  execute(
    projectId: string,
    newsId: number,
    state: boolean
  ): Observable<Result<number, { kind: "toggle_project_news_like_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.toggleLike(projectId, newsId, state).pipe(
      map(() => ok<number>(newsId)),
      catchError(error =>
        of(fail({ kind: "toggle_project_news_like_error" as const, cause: error }))
      )
    );
  }
}
