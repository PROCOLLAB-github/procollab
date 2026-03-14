/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectNewsRepositoryPort } from "../../../domain/project/ports/project-news.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ToggleProjectNewsLikeUseCase {
  private readonly projectNewsRepositoryPort = inject(ProjectNewsRepositoryPort);

  execute(
    projectId: string,
    newsId: number,
    state: boolean
  ): Observable<Result<number, { kind: "toggle_project_news_like_error"; cause?: unknown }>> {
    return this.projectNewsRepositoryPort.toggleLike(projectId, newsId, state).pipe(
      map(() => ok<number>(newsId)),
      catchError(error =>
        of(fail({ kind: "toggle_project_news_like_error" as const, cause: error }))
      )
    );
  }
}
