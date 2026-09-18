/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { ProjectCoverReset } from "@domain/project/project-cover.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

export type ResetProjectCoverError = "unavailable" | "forbidden" | "failed";

/** Команда сброса с безопасными ошибками: серверный HTTP body не выводится пользователю. */
@Injectable({ providedIn: "root" })
export class ResetProjectCoverUseCase {
  private readonly repository = inject(ProjectRepositoryPort);

  /** Принимает только реальный Project.id; успешный ответ обязан содержать стандартный URL. */
  execute(id: number): Observable<Result<ProjectCoverReset, ResetProjectCoverError>> {
    if (!Number.isSafeInteger(id) || id <= 0) return of(fail<ResetProjectCoverError>("failed"));
    return this.repository.resetCover(id).pipe(
      map(result =>
        result.isDefaultCover === true && !!result.coverImageAddress
          ? ok(result)
          : fail<ResetProjectCoverError>("failed"),
      ),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 409 && error.error?.code === "default_cover_unavailable") {
            return of(fail<ResetProjectCoverError>("unavailable"));
          }
          if (error.status === 401 || error.status === 403) {
            return of(fail<ResetProjectCoverError>("forbidden"));
          }
        }
        return of(fail<ResetProjectCoverError>("failed"));
      }),
    );
  }
}
