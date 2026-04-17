/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";
import { FeedNews } from "@domain/project/project-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class AddProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(ProjectNewsRepositoryPort);

  execute(
    projectId: string,
    news: { text: string; files: string[] }
  ): Observable<Result<FeedNews, { kind: "add_project_news_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.addNews(projectId, news).pipe(
      map(result => ok<FeedNews>(result)),
      catchError(error => of(fail({ kind: "add_project_news_error" as const, cause: error })))
    );
  }
}
