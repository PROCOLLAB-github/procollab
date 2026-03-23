/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { AuthRepositoryPort } from "../../../domain/auth/ports/auth.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DownloadCvUseCase {
  private readonly authRepositoryPort = inject(AuthRepositoryPort);

  execute(): Observable<Result<Blob, { kind: "download_cv_error"; cause?: unknown }>> {
    return this.authRepositoryPort.downloadCV().pipe(
      map(file => ok<Blob>(file)),
      catchError(error => of(fail({ kind: "download_cv_error" as const, cause: error })))
    );
  }
}
