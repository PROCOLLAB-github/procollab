/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { Partner, PartnerDto } from "@domain/project/partner.model";

/** HTTP-адаптер партнёров проекта: `/projects/<id>/partners`. */
@Injectable({ providedIn: "root" })
export class ProjectPartnerHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  /** Если компания с таким ИНН уже существует — создаёт или обновляет связь ProjectCompany. */
  addPartner(id: number, params: PartnerDto): Observable<Partner> {
    return this.apiService.post(`${this.PROJECTS_URL}/${id}/companies/`, params);
  }

  getPartners(id: number): Observable<Partner[]> {
    return this.apiService.get(`${this.PROJECTS_URL}/${id}/companies/list/`);
  }

  editParter(
    projectId: number,
    companyId: number,
    params: Pick<PartnerDto, "contribution" | "decisionMaker">
  ): Observable<Partner[]> {
    return this.apiService.patch(
      `${this.PROJECTS_URL}/${projectId}/companies/${companyId}/`,
      params
    );
  }

  /** Компания в базе остаётся, удаляется только запись ProjectCompany. */
  deletePartner(projectId: number, companyId: number): Observable<void> {
    return this.apiService.delete<void>(
      `${this.PROJECTS_URL}/${projectId}/companies/${companyId}/`
    );
  }
}
