/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { SaveProfileError } from "@domain/auth/results/save-profile.result";
import { User, UserInput } from "@domain/auth/user.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, concatMap, map, Observable, of } from "rxjs";

export type SaveProfileResultError = { kind: "profile_edit_error"; cause?: SaveProfileError };

@Injectable({ providedIn: "root" })
export class SaveProfileUseCase {
  private readonly authRepository = inject(AuthRepositoryPort);

  execute(command: UserInput): Observable<Result<User, SaveProfileResultError>> {
    return this.authRepository.updateProfile(command).pipe(
      // updateProfile отдаёт неполный ответ — дочитываем актуальный профиль.
      // Это внутренний шаг операции «сохранить», поэтому он здесь, а не в фасаде.
      concatMap(() => this.authRepository.fetchProfile()),
      map(profile => ok<User>(profile)),
      catchError(error =>
        of(fail<SaveProfileResultError>({ kind: "profile_edit_error", cause: error }))
      )
    );
  }
}
