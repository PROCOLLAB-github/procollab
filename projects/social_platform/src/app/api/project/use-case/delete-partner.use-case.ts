/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProjectPartnerRepositoryPort } from "../../../domain/project/ports/project-partner.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DeletePartnerUseCase {
  private readonly projectPartnerRepositoryPort = inject(ProjectPartnerRepositoryPort);

  execute(
    projectId: number,
    partnerId: number
  ): Observable<Result<void, { kind: "delete_project_partner_error"; cause?: unknown }>> {
    return this.projectPartnerRepositoryPort.deletePartner(projectId, partnerId).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "delete_project_partner_error" as const, cause: error })))
    );
  }
}
