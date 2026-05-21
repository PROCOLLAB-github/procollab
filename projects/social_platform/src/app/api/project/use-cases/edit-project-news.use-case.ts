/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { FeedNews } from "@domain/news/project-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: отредактировать новость проекта; ошибка → `edit_project_news_error`. */
@Injectable({ providedIn: "root" })
export class EditProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);

  execute(
    projectId: string,
    newsId: number,
    news: Partial<FeedNews>
  ): Observable<Result<FeedNews, { kind: "edit_project_news_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.editNews(projectId, newsId, news).pipe(
      map(result => ok<FeedNews>(result)),
      catchError(error => of(fail({ kind: "edit_project_news_error" as const, cause: error })))
    );
  }
}
