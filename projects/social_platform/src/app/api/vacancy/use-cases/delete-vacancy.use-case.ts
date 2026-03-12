/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DeleteVacancyUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);

  execute(
    vacancyId: number
  ): Observable<Result<void, { kind: "delete_vacancy_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.deleteVacancy(vacancyId).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "delete_vacancy_error" as const, cause: error })))
    );
  }
}
