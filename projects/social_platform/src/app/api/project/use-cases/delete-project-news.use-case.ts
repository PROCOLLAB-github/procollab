/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { deleteNews } from "@domain/project/events/project-news.event";

/** Сценарий: удалить новость проекта (возвращает newsId); ошибка → `delete_project_news_error`. */
@Injectable({ providedIn: "root" })
export class DeleteProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);
  private readonly eventBus = inject(EventBus);

  execute(
    projectId: string,
    newsId: number
  ): Observable<Result<number, { kind: "delete_project_news_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.delete(projectId, newsId).pipe(
      tap(() => this.eventBus.emit(deleteNews(projectId, String(newsId)))),
      map(() => ok<number>(newsId)),
      catchError(error => of(fail({ kind: "delete_project_news_error" as const, cause: error })))
    );
  }
}
