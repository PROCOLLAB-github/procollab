/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramNewsRepositoryPort } from "@domain/program/ports/program-news.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ReadNewsUseCase {
  private readonly programNewsRepositoryPort = inject(ProgramNewsRepositoryPort);

  execute(programId: string, newsIds: number[]): Observable<Result<void, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.readNews(programId, newsIds).pipe(
      map(() => ok<void>(undefined)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
