/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { FeedNews } from "@domain/news/project-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { editNews } from "@domain/project/events/project-news.event";

/** Сценарий: отредактировать новость проекта; ошибка → `edit_project_news_error`. */
@Injectable({ providedIn: "root" })
export class EditProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);
  private readonly eventBus = inject(EventBus);

  execute(
    projectId: string,
    newsId: number,
    news: Partial<FeedNews>
  ): Observable<Result<FeedNews, { kind: "edit_project_news_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.editNews(projectId, newsId, news).pipe(
      tap(() => this.eventBus.emit(editNews(projectId, String(newsId)))),
      map(result => ok<FeedNews>(result)),
      catchError(error => of(fail({ kind: "edit_project_news_error" as const, cause: error })))
    );
  }
}
