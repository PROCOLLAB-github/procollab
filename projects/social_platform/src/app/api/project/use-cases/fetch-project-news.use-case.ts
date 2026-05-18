/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedNews } from "@domain/news/project-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROJECT_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

@Injectable({ providedIn: "root" })
export class FetchProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(PROJECT_NEWS_REPOSITORY);

  execute(
    projectId: string
  ): Observable<
    Result<ApiPagination<FeedNews>, { kind: "fetch_project_news_error"; cause?: unknown }>
  > {
    return this.projectNewsRepositoryPort.fetchNews(projectId).pipe(
      map(news => ok<ApiPagination<FeedNews>>(news)),
      catchError(error => of(fail({ kind: "fetch_project_news_error" as const, cause: error })))
    );
  }
}
