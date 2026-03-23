/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { ProjectNewsRepositoryPort } from "../../../domain/project/ports/project-news.repository.port";
import { FeedNews } from "../../../domain/project/project-news.model";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class FetchProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(ProjectNewsRepositoryPort);

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
