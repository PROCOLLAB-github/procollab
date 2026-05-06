/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramNewsRepositoryPort } from "@domain/program/ports/program-news.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DeleteNewsUseCase {
  private readonly programNewsRepositoryPort = inject(ProgramNewsRepositoryPort);

  execute(programId: number, newsId: number): Observable<Result<number, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.deleteNews(programId, newsId).pipe(
      map(() => ok<number>(newsId)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
