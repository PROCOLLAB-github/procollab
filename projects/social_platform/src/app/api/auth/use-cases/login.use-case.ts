/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthRepositoryPort } from "../../../domain/auth/ports/auth.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { LoginCommand } from "../../../domain/auth/commands/login.command";
import { LoginError, LoginResult } from "../../../domain/auth/results/login.result";

@Injectable({ providedIn: "root" })
export class LoginUseCase {
  private readonly authRepositoryPort = inject(AuthRepositoryPort);

  execute(command: LoginCommand): Observable<Result<LoginResult, LoginError>> {
    return this.authRepositoryPort.login(command).pipe(
      map(tokens => ok<LoginResult>({ tokens })),
      catchError(error => {
        if (error.status === 401) {
          return of(fail<LoginError>({ kind: "wrong_credentials" }));
        }

        return of(fail<LoginError>({ kind: "unknown" }));
      })
    );
  }
}
