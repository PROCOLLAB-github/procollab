/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, tap } from "rxjs";
import { FeedNews } from "@domain/news/project-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { addNews } from "@domain/project/events/project-news.event";

/** Сценарий: создать новость проекта; ошибка → `add_project_news_error`. */
@Injectable({ providedIn: "root" })
export class AddProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);
  private readonly eventBus = inject(EventBus);

  execute(
    projectId: string,
    news: { text: string; files: string[] },
  ): Observable<Result<FeedNews, { kind: "add_project_news_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.addNews(projectId, news).pipe(
      tap(() => this.eventBus.emit(addNews(projectId))),
      map(result => ok<FeedNews>(result)),
      catchError(error => of(fail({ kind: "add_project_news_error" as const, cause: error }))),
    );
  }
}
