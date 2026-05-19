/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { Industry } from "@domain/industry/industry.model";

export type GetIndustriesError = { kind: "server_error"; cause?: unknown };

/** Сценарий: загрузить справочник отраслей (наполняет signal-кеш репозитория). */
@Injectable({ providedIn: "root" })
export class GetIndustriesUseCase {
  private readonly industryRepository = inject(IndustryRepositoryPort);

  execute(): Observable<Result<Industry[], GetIndustriesError>> {
    return this.industryRepository.getAll().pipe(
      map(industries => ok<Industry[]>(industries)),
      catchError(error => of(fail<GetIndustriesError>({ kind: "server_error", cause: error })))
    );
  }
}
