/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { Partner, PartnerDto } from "../../../domain/project/partner.model";
import { ProjectPartnerRepositoryPort } from "../../../domain/project/ports/project-partner.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class CreatePartnerUseCase {
  private readonly projectPartnerRepositoryPort = inject(ProjectPartnerRepositoryPort);

  execute(
    projectId: number,
    partner: PartnerDto
  ): Observable<Result<Partner, { kind: "create_project_partner_error"; cause?: unknown }>> {
    return this.projectPartnerRepositoryPort.createPartner(projectId, partner).pipe(
      map(result => ok<Partner>(result)),
      catchError(error => of(fail({ kind: "create_project_partner_error" as const, cause: error })))
    );
  }
}
