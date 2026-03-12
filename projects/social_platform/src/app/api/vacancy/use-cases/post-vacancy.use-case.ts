/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { CreateVacancyDto } from "../../project/dto/create-vacancy.model";
import { Vacancy } from "../../../domain/vacancy/vacancy.model";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class PostVacancyUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);

  execute(
    projectId: number,
    vacancy: CreateVacancyDto
  ): Observable<Result<Vacancy, { kind: "post_vacancy_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.postVacancy(projectId, vacancy).pipe(
      map(createdVacancy => ok<Vacancy>(createdVacancy)),
      catchError(error => of(fail({ kind: "post_vacancy_error" as const, cause: error })))
    );
  }
}
