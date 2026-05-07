/** @format */

import { inject, Injectable } from "@angular/core";
import { ProjectPartnerHttpAdapter } from "../../adapters/project/project-partner-http.adapter";
import { map, Observable } from "rxjs";
import { Partner, PartnerDto } from "@domain/project/partner.model";
import { plainToInstance } from "class-transformer";
import { ProjectPartnerRepositoryPort } from "@domain/project/ports/project-partner.repository.port";

@Injectable({ providedIn: "root" })
export class ProjectPartnerRepository implements ProjectPartnerRepositoryPort {
  private readonly projectPartnerAdapter = inject(ProjectPartnerHttpAdapter);

  createPartner(id: number, params: PartnerDto): Observable<Partner> {
    return this.projectPartnerAdapter
      .addPartner(id, params)
      .pipe(map(partner => plainToInstance(Partner, partner)));
  }

  fetchAll(id: number): Observable<Partner[]> {
    return this.projectPartnerAdapter
      .getPartners(id)
      .pipe(map(partners => plainToInstance(Partner, partners)));
  }

  updatePartner(
    projectId: number,
    companyId: number,
    params: Pick<PartnerDto, "contribution" | "decisionMaker">
  ): Observable<Partner[]> {
    return this.projectPartnerAdapter
      .editParter(projectId, companyId, params)
      .pipe(map(partners => plainToInstance(Partner, partners)));
  }

  deletePartner(projectId: number, companyId: number): Observable<void> {
    return this.projectPartnerAdapter.deletePartner(projectId, companyId);
  }
}
