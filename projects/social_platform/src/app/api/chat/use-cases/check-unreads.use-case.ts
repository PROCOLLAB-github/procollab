/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";
import { ChatRepositoryPort } from "../../../domain/chat/ports/chat.repository.port";

export type CheckUnreadsError = { kind: "server_error" };

@Injectable({ providedIn: "root" })
export class CheckUnreadsUseCase {
  private readonly chatRepository = inject(ChatRepositoryPort);

  execute(): Observable<Result<boolean, CheckUnreadsError>> {
    return this.chatRepository.hasUnreads().pipe(
      map(hasUnreads => ok<boolean>(hasUnreads)),
      catchError(() => of(fail<CheckUnreadsError>({ kind: "server_error" })))
    );
  }
}
