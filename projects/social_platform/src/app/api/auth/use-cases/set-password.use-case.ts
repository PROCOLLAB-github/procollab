/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

@Injectable({ providedIn: "root" })
export class SetPasswordUseCase {
  private readonly authRepositoryPort = inject(AuthRepositoryPort);

  execute(
    password: string,
    token: string
  ): Observable<Result<void, { kind: "unknown"; cause?: unknown }>> {
    return this.authRepositoryPort.setPassword(password, token).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "unknown" as const, cause: error })))
    );
  }
}
