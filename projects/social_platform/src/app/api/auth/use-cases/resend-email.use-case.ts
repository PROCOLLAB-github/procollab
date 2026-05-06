/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ResendEmailUseCase {
  private readonly authRepositoryPort = inject(AuthRepositoryPort);

  execute(email: string): Observable<Result<void, { kind: "unknown" }>> {
    return this.authRepositoryPort.resendEmail(email).pipe(
      map(() => ok<void>(undefined)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
