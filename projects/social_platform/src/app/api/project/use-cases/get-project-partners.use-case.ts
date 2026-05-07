/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { Partner } from "@domain/project/partner.model";
import { ProjectPartnerRepositoryPort } from "@domain/project/ports/project-partner.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetProjectPartnersUseCase {
  private readonly projectPartnerRepositoryPort = inject(ProjectPartnerRepositoryPort);

  execute(
    projectId: number
  ): Observable<Result<Partner[], { kind: "get_project_partners_error"; cause?: unknown }>> {
    return this.projectPartnerRepositoryPort.fetchAll(projectId).pipe(
      map(partners => ok<Partner[]>(partners)),
      catchError(error => of(fail({ kind: "get_project_partners_error" as const, cause: error })))
    );
  }
}
