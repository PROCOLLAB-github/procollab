/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: удалить новость проекта (возвращает newsId); ошибка → `delete_project_news_error`. */
@Injectable({ providedIn: "root" })
export class DeleteProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);

  execute(
    projectId: string,
    newsId: number
  ): Observable<Result<number, { kind: "delete_project_news_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.delete(projectId, newsId).pipe(
      map(() => ok<number>(newsId)),
      catchError(error => of(fail({ kind: "delete_project_news_error" as const, cause: error })))
    );
  }
}
