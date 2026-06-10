/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROGRAM_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: отметить новости программы просмотренными; ошибка → `unknown`. */
@Injectable({ providedIn: "root" })
export class ReadNewsUseCase {
  private readonly programNewsRepositoryPort = inject(PROGRAM_NEWS_REPOSITORY);

  execute(programId: string, newsIds: number[]): Observable<Result<void, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.readNews(Number(programId), newsIds).pipe(
      map(() => ok<void>(undefined)),
      catchError(() => of(fail({ kind: "unknown" as const }))),
    );
  }
}
