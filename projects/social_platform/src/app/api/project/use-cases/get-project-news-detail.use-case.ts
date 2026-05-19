/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { FeedNews } from "@domain/news/project-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: одна новость проекта по id; ошибка → `get_project_news_detail_error`. */
@Injectable({ providedIn: "root" })
export class GetProjectNewsDetailUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);

  execute(
    projectId: string,
    newsId: string
  ): Observable<Result<FeedNews, { kind: "get_project_news_detail_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.fetchNewsDetail(projectId, newsId).pipe(
      map(news => ok<FeedNews>(news)),
      catchError(error =>
        of(fail({ kind: "get_project_news_detail_error" as const, cause: error }))
      )
    );
  }
}
