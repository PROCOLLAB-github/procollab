/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROGRAM_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: переключить лайк новости программы (возвращает newsId); ошибка → `unknown`. */
@Injectable({ providedIn: "root" })
export class ToggleLikeUseCase {
  private readonly programNewsRepositoryPort = inject(PROGRAM_NEWS_REPOSITORY);

  execute(
    programId: string,
    newsId: number,
    state: boolean,
  ): Observable<Result<number, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.toggleLike(programId, newsId, state).pipe(
      map(() => ok<number>(newsId)),
      catchError(() => of(fail({ kind: "unknown" as const }))),
    );
  }
}
