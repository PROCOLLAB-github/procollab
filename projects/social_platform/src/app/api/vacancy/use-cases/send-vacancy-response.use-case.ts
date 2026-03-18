/** @format */

import { inject, Injectable } from "@angular/core";
import { VacancyRepositoryPort } from "../../../domain/vacancy/ports/vacancy.repository.port";
import { catchError, map, Observable, of, switchMap, tap } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { EventBus } from "../../../domain/shared/event-bus";
import { sendVacancyResponse } from "../../../domain/vacancy/events/send-vacancy-response.event";

@Injectable({ providedIn: "root" })
export class SendVacancyResponseUseCase {
  private readonly vacancyRepositoryPort = inject(VacancyRepositoryPort);
  private readonly eventBus = inject(EventBus);

  execute(
    vacancyId: number,
    body: { whyMe: string }
  ): Observable<Result<void, { kind: "send_vacancy_response_error"; cause?: unknown }>> {
    return this.vacancyRepositoryPort.sendResponse(vacancyId, body).pipe(
      switchMap(response =>
        this.vacancyRepositoryPort.getOne(vacancyId).pipe(
          tap(vacancy =>
            this.eventBus.emit(
              sendVacancyResponse(
                response.id,
                vacancyId,
                vacancy.project.id,
                response.user.id,
                response.isApproved ?? false
              )
            )
          ),
          map(() => ok<void>(undefined))
        )
      ),
      catchError(error => of(fail({ kind: "send_vacancy_response_error" as const, cause: error })))
    );
  }
}
