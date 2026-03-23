/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectNewsRepositoryPort } from "../../../domain/project/ports/project-news.repository.port";
import { FeedNews } from "../../../domain/project/project-news.model";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProjectNewsDetailUseCase {
  private readonly projectNewsRepositoryPort = inject(ProjectNewsRepositoryPort);

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
