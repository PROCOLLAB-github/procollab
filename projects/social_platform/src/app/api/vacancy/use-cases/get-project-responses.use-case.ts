/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { VacancyResponse } from "../../../domain/vacancy/vacancy-response.model";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProjectResponsesUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);

  execute(
    projectId: number
  ): Observable<
    Result<VacancyResponse[], { kind: "get_project_responses_error"; cause?: unknown }>
  > {
    return this.vacancyRepositoryPort.responsesByProject(projectId).pipe(
      map(responses => ok<VacancyResponse[]>(responses)),
      catchError(error => of(fail({ kind: "get_project_responses_error" as const, cause: error })))
    );
  }
}
