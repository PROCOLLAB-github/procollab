/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User } from "@domain/auth/user.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of, take } from "rxjs";

@Injectable({ providedIn: "root" })
export class GetProfileUseCase {
  private readonly authRepository = inject(AuthRepositoryPort);

  execute(): Observable<Result<User, { kind: "server_error"; cause?: unknown }>> {
    return this.authRepository.profile.pipe(
      map(profile => ok<User>(profile)),
      catchError(error => of(fail({ kind: "server_error", cause: error } as const)))
    );
  }
}
