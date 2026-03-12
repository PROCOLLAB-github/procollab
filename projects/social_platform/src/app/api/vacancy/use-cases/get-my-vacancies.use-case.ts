/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { VacancyResponse } from "../../../domain/vacancy/vacancy-response.model";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetMyVacanciesUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);

  execute(
    limit: number,
    offset: number
  ): Observable<Result<VacancyResponse[], { kind: "get_my_vacancies_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.getMyVacancies(limit, offset).pipe(
      map(responses => ok<VacancyResponse[]>(responses)),
      catchError(error => of(fail({ kind: "get_my_vacancies_error" as const, cause: error })))
    );
  }
}
