/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DeleteProjectNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(ProjectNewsRepositoryPort);

  execute(
    projectId: string,
    newsId: number
  ): Observable<Result<number, { kind: "delete_project_news_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.delete(projectId, newsId).pipe(
      map(() => ok<number>(newsId)),
      catchError(error => of(fail({ kind: "delete_project_news_error" as const, cause: error })))
    );
  }
}
