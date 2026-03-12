/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { CreateVacancyDto } from "../../project/dto/create-vacancy.model";
import { Vacancy } from "../../../domain/vacancy/vacancy.model";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class UpdateVacancyUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);

  execute(
    vacancyId: number,
    vacancy: Partial<Vacancy> | CreateVacancyDto
  ): Observable<Result<Vacancy, { kind: "update_vacancy_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.updateVacancy(vacancyId, vacancy).pipe(
      map(updatedVacancy => ok<Vacancy>(updatedVacancy)),
      catchError(error => of(fail({ kind: "update_vacancy_error" as const, cause: error })))
    );
  }
}
