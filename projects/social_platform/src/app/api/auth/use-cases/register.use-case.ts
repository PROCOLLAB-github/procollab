/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthRepositoryPort } from "../../../domain/auth/ports/auth.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { RegisterCommand } from "../../../domain/auth/commands/register.command";
import { RegisterError, RegisterFieldErrors } from "../../../domain/auth/results/register.result";

@Injectable({ providedIn: "root" })
export class RegisterUseCase {
  private readonly authRepositoryPort = inject(AuthRepositoryPort);

  execute(command: RegisterCommand): Observable<Result<void, RegisterError>> {
    return this.authRepositoryPort.register(command).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => {
        if (error.status === 500) {
          return of(fail<RegisterError>({ kind: "server_error" }));
        }

        if (error.status === 400) {
          return of(
            fail<RegisterError>({
              kind: "validation_error",
              errors: (error.error ?? {}) as RegisterFieldErrors,
            })
          );
        }

        return of(fail<RegisterError>({ kind: "unknown", cause: error }));
      })
    );
  }
}
