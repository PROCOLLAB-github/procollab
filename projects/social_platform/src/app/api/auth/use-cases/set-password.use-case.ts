/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { PasswordError } from "@domain/auth/results/password.result";
import { setPasswordError } from "../password-error";

/** Устанавливает пароль по одноразовой ссылке; различает ошибку ссылки, пароля и соединения. */
@Injectable({ providedIn: "root" })
export class SetPasswordUseCase {
  private readonly authRepositoryPort = inject(AuthRepositoryPort);

  execute(password: string, token: string): Observable<Result<void, PasswordError>> {
    return this.authRepositoryPort.setPassword(password, token).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail(setPasswordError(error)))),
    );
  }
}
