/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectNewsRepositoryPort } from "../../../domain/project/ports/project-news.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ReadProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(ProjectNewsRepositoryPort);

  execute(
    projectId: number,
    newsIds: number[]
  ): Observable<Result<void[], { kind: "read_project_news_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.readNews(projectId, newsIds).pipe(
      map(result => ok<void[]>(result)),
      catchError(error => of(fail({ kind: "read_project_news_error" as const, cause: error })))
    );
  }
}
