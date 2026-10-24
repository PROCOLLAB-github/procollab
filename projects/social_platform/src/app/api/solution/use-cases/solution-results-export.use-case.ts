/** @format */

import { inject, Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { catchError, defer, map, of } from "rxjs";
import {
  SolutionRepositoryPort,
  SolutionResultsExportQuery,
} from "@domain/solution/ports/solution.repository.port";
import { fail, ok } from "@domain/shared/result.type";
import { solutionError } from "../solution-error";

@Injectable({ providedIn: "root" })
export class ExportSolutionResultsUseCase {
  private readonly repository = inject(SolutionRepositoryPort);

  execute(programId: number, query?: SolutionResultsExportQuery) {
    return defer(() => this.repository.exportResults(programId, query)).pipe(
      map(value => ok(value)),
      catchError((error: unknown) => {
        const fallback = () => fail(solutionError(error));
        if (!(error instanceof HttpErrorResponse) || !(error.error instanceof Blob)) {
          return of(fallback());
        }
        // responseType=blob относится и к JSON-ошибке API.
        const body: Blob = error.error;
        return defer(() => body.text()).pipe(
          map(text =>
            fail(
              solutionError(
                new HttpErrorResponse({
                  error: JSON.parse(text),
                  status: error.status,
                  statusText: error.statusText,
                  headers: error.headers,
                  url: error.url ?? undefined,
                }),
              ),
            ),
          ),
          catchError(() => of(fallback())),
        );
      }),
    );
  }
}
