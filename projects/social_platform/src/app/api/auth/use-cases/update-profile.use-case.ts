/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User, UserInput } from "@domain/auth/user.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: "root" })
export class UpdateProfileUseCase {
  private readonly authRepository = inject(AuthRepositoryPort);

  execute(data: UserInput): Observable<Result<User, { kind: "server_error"; cause?: unknown }>> {
    return this.authRepository.updateProfile(data).pipe(
      map(profile => ok<User>(profile)),
      catchError(error => of(fail({ kind: "server_error", cause: error } as const)))
    );
  }
}
