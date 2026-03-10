/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { AuthRepositoryPort } from "../../../domain/auth/ports/auth.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ResetPasswordUseCase {
  private readonly authRepositoryPort = inject(AuthRepositoryPort);

  execute(email: string): Observable<Result<void, { kind: "unknown" }>> {
    return this.authRepositoryPort.resetPassword(email).pipe(
      map(() => ok<void>(undefined)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
