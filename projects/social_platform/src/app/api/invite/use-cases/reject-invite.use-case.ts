/** @format */

import { inject, Injectable } from "@angular/core";
import { InviteRepositoryPort } from "../../../domain/invite/ports/invite.repository.port";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class RejectInviteUseCase {
  private readonly inviteRepositoryPort = inject(InviteRepositoryPort);

  execute(inviteId: number): Observable<Result<void, { kind: "unknown" }>> {
    return this.inviteRepositoryPort.rejectInvite(inviteId).pipe(
      map(() => ok<void>(undefined)),
      catchError(() => of(fail({ kind: "unknown" as const })))
    );
  }
}
