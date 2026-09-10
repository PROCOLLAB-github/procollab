/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ProgramAnalyticsOverview } from "@domain/program/program-analytics.model";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

export interface ProgramManagerOverviewFailure {
  kind: "manager_overview_error";
  status: number;
}

/** Загружает обезличенную сводку программы, доступную её организатору. */
@Injectable({ providedIn: "root" })
export class GetProgramManagerOverviewUseCase {
  private readonly programRepository = inject(ProgramRepositoryPort);

  execute(
    programId: number,
  ): Observable<Result<ProgramAnalyticsOverview, ProgramManagerOverviewFailure>> {
    return this.programRepository.getManagerOverview(programId).pipe(
      map(overview => ok(overview)),
      catchError((error: unknown) =>
        of(
          fail({
            kind: "manager_overview_error" as const,
            status: error instanceof HttpErrorResponse ? error.status : 0,
          }),
        ),
      ),
    );
  }
}
