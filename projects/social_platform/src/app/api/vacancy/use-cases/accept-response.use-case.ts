/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class AcceptResponseUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);

  execute(
    responseId: number
  ): Observable<Result<void, { kind: "accept_response_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.acceptResponse(responseId).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "accept_response_error" as const, cause: error })))
    );
  }
}
