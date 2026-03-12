/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { Vacancy } from "../../../domain/vacancy/vacancy.model";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

export interface GetVacanciesParams {
  limit: number;
  offset: number;
  projectId?: number;
  requiredExperience?: string;
  workFormat?: string;
  workSchedule?: string;
  salary?: string;
  searchValue?: string;
}

@Injectable({ providedIn: "root" })
export class GetVacanciesUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);

  execute(
    params: GetVacanciesParams
  ): Observable<Result<Vacancy[], { kind: "get_vacancies_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort
      .getForProject(
        params.limit,
        params.offset,
        params.projectId,
        params.requiredExperience,
        params.workFormat,
        params.workSchedule,
        params.salary,
        params.searchValue
      )
      .pipe(
        map(vacancies => ok<Vacancy[]>(vacancies)),
        catchError(error => of(fail({ kind: "get_vacancies_error" as const, cause: error })))
      );
  }
}
