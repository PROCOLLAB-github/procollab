/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { HttpErrorResponse } from "@angular/common/http";

/** Сценарий: повторно отправить письмо подтверждения email; ошибки разложены по статусам (400/500/network). */
@Injectable({ providedIn: "root" })
export class ResendEmailUseCase {
  private readonly authRepositoryPort = inject(AuthRepositoryPort);

  execute(
    email: string,
  ): Observable<
    Result<
      void,
      | { kind: "bad_request"; status: 400 }
      | { kind: "server_error"; status: 500 }
      | { kind: "network"; status: 0; cause: "unknown" }
    >
  > {
    return this.authRepositoryPort.resendEmail(email).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 400) {
            return of(fail({ kind: "bad_request", status: 400 } as const));
          }

          if (error.status === 500) {
            return of(fail({ kind: "server_error", status: 500 } as const));
          }

          if (error.status === 0) {
            return of(fail({ kind: "network", status: 0, cause: "unknown" } as const));
          }
        }

        return of(fail({ kind: "network", status: 0, cause: "unknown" } as const));
      }),
    );
  }
}
