/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { readNews } from "@domain/project/events/project-news.event";

/** Сценарий: отметить новости проекта просмотренными; ошибка → `read_project_news_error`. */
@Injectable({ providedIn: "root" })
export class ReadProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);
  private readonly eventBus = inject(EventBus);

  execute(
    projectId: number,
    newsIds: number[],
  ): Observable<Result<void[], { kind: "read_project_news_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.readNews(projectId, newsIds).pipe(
      tap(() => this.eventBus.emit(readNews(String(projectId)))),
      map(result => ok<void[]>(result)),
      catchError(error => of(fail({ kind: "read_project_news_error" as const, cause: error }))),
    );
  }
}
