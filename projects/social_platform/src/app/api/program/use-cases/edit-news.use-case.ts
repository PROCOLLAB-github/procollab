/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramNewsRepositoryPort } from "../../../domain/program/ports/program-news.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";
import { FeedNews } from "../../../domain/project/project-news.model";

@Injectable({ providedIn: "root" })
export class EditNewsUseCase {
  private readonly programNewsRepositoryPort = inject(ProgramNewsRepositoryPort);

  execute(
    programId: number,
    newsId: number,
    newsItem: Partial<FeedNews>
  ): Observable<Result<FeedNews, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.editNews(programId, newsId, newsItem).pipe(
      map(news => ok<FeedNews>(news)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
