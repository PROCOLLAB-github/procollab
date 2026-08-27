/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: "root" })
export class GetVacancyResponsesUseCase {
  private readonly vacancyRepository = inject(VacancyRepositoryPort);

  execute(
    vacancyId: number,
  ): Observable<
    Result<VacancyResponse[], { kind: "get_vacancy_responses_error"; cause?: unknown }>
  > {
    return this.vacancyRepository.responsesByVacancy(vacancyId).pipe(
      map(responses => ok<VacancyResponse[]>(responses)),
      catchError(cause => of(fail({ kind: "get_vacancy_responses_error" as const, cause }))),
    );
  }
}
