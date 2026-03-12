/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class SendVacancyResponseUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);

  execute(
    vacancyId: number,
    body: { whyMe: string }
  ): Observable<Result<void, { kind: "send_vacancy_response_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.sendResponse(vacancyId, body).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "send_vacancy_response_error" as const, cause: error })))
    );
  }
}
