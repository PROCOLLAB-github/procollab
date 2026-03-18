/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { catchError, map, Observable, of, tap } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { EventBus } from "../../../domain/shared/event-bus";
import { vacancyDelete } from "../../../domain/vacancy/events/vacancy-deleted.event";

@Injectable({ providedIn: "root" })
export class DeleteVacancyUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(
    vacancyId: number
  ): Observable<Result<void, { kind: "delete_vacancy_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.deleteVacancy(vacancyId).pipe(
      tap(() => this.eventBus.emit(vacancyDelete(vacancyId))),
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "delete_vacancy_error" as const, cause: error })))
    );
  }
}
