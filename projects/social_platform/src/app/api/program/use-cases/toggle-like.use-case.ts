/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramNewsRepositoryPort } from "../../../domain/program/ports/program-news.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ToggleLikeUseCase {
  private readonly programNewsRepositoryPort = inject(ProgramNewsRepositoryPort);

  execute(
    programId: string,
    newsId: number,
    state: boolean
  ): Observable<Result<number, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.toggleLike(programId, newsId, state).pipe(
      map(() => ok<number>(newsId)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
