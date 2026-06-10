/** @format */

import { Observable } from "rxjs";
import { Partner, PartnerDto } from "../partner.model";

/** Порт репозитория партнёров проекта */
export abstract class ProjectPartnerRepositoryPort {
  abstract fetchAll(projectId: number): Observable<Partner[]>;
  abstract createPartner(projectId: number, params: PartnerDto): Observable<Partner>;
  abstract updatePartner(
    projectId: number,
    companyId: number,
    params: Pick<PartnerDto, "contribution" | "decisionMaker">,
  ): Observable<Partner[]>;
  abstract deletePartner(projectId: number, companyId: number): Observable<void>;
}
