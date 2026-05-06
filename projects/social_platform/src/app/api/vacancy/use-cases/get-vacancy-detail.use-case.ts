/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetVacancyDetailUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);

  execute(
    vacancyId: number
  ): Observable<Result<Vacancy, { kind: "get_vacancy_detail_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.getOne(vacancyId).pipe(
      map(vacancy => ok<Vacancy>(vacancy)),
      catchError(error => of(fail({ kind: "get_vacancy_detail_error" as const, cause: error })))
    );
  }
}
