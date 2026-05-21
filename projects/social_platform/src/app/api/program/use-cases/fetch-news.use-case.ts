/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedNews } from "@domain/news/project-news.model";
import { PROGRAM_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: страница новостей программы; ошибка → `unknown`. */
@Injectable({ providedIn: "root" })
export class FetchNewsUseCase {
  private readonly programNewsRepositoryPort = inject(PROGRAM_NEWS_REPOSITORY);

  execute(
    limit: number,
    offset: number,
    programId: number
  ): Observable<Result<ApiPagination<FeedNews>, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.fetchNews(String(programId), limit, offset).pipe(
      map(news => ok(news)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
