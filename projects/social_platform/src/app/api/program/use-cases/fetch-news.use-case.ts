/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramNewsRepositoryPort } from "@domain/program/ports/program-news.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedNews } from "@domain/project/project-news.model";

@Injectable({ providedIn: "root" })
export class FetchNewsUseCase {
  private readonly programNewsRepositoryPort = inject(ProgramNewsRepositoryPort);

  execute(
    limit: number,
    offset: number,
    programId: number
  ): Observable<Result<ApiPagination<FeedNews>, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.fetchNews(limit, offset, programId).pipe(
      map(news => ok(news)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
