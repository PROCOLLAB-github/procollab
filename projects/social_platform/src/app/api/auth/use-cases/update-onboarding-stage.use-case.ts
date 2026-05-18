/** @format */

import { inject, Injectable } from "@angular/core";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User } from "@domain/auth/user.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: "root" })
export class UpdateOnboardingStageUseCase {
  private readonly authRepository = inject(AuthRepositoryPort);

  execute(
    stage: number | null
  ): Observable<Result<User, { kind: "server_error"; cause?: unknown }>> {
    return this.authRepository.updateOnboardingStage(stage).pipe(
      map(profile => ok<User>(profile)),
      catchError(error => of(fail({ kind: "server_error", cause: error } as const)))
    );
  }
}
