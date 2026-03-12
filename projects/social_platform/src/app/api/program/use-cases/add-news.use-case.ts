/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramNewsRepositoryPort } from "../../../domain/program/ports/program-news.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { FeedNews } from "../../../domain/project/project-news.model";

@Injectable({ providedIn: "root" })
export class AddNewsUseCase {
  private readonly programNewsRepositoryPort = inject(ProgramNewsRepositoryPort);

  execute(
    programId: number,
    news: { text: string; files: string[] }
  ): Observable<Result<FeedNews, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.addNews(programId, news).pipe(
      map(news => ok<FeedNews>(news)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
