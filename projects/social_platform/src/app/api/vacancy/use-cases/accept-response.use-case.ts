/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { catchError, map, Observable, of, switchMap, tap } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { EventBus } from "@domain/shared/event-bus";
import { acceptVacancyResponse } from "@domain/vacancy/events/accept-vacancy-response.event";

@Injectable({ providedIn: "root" })
export class AcceptResponseUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(
    responseId: number
  ): Observable<Result<void, { kind: "accept_response_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.acceptResponse(responseId).pipe(
      switchMap(response =>
        this.vacancyRepositoryPort.getOne(response.vacancy).pipe(
          tap(vacancy =>
            this.eventBus.emit(
              acceptVacancyResponse(
                response.id,
                response.vacancy,
                vacancy.project.id,
                response.user.id
              )
            )
          ),
          map(() => ok<void>(undefined))
        )
      ),
      catchError(error => of(fail({ kind: "accept_response_error" as const, cause: error })))
    );
  }
}
