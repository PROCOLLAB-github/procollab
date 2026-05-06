/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { Partner, PartnerDto } from "@domain/project/partner.model";

@Injectable({ providedIn: "root" })
export class ProjectPartnerHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  /**
   *
   * @param id
   * @param params
   * @returns Создать или привязать компанию к проекту.
   * Если компания с таким ИНН уже существует — создаёт или обновляет связь ProjectCompany.
   * Если компании нет — создаёт новую и тут же привязывает.
   */
  addPartner(id: number, params: PartnerDto): Observable<Partner> {
    return this.apiService.post(`${this.PROJECTS_URL}/${id}/companies/`, params);
  }

  /**
   * Получить список всех компаний-партнёров (связей ProjectCompany) конкретного проекта.
   *
   * @param id
   *
   * @returns данные компании
   * @returns вклад
   * @returns ответственного
   */
  getPartners(id: number): Observable<Partner[]> {
    return this.apiService.get(`${this.PROJECTS_URL}/${id}/companies/list/`);
  }

  /**
   * @param projectId
   * @param companyId
   *
   * @returns Обновить информацию о связи проекта с компанией.
   * Можно изменить вклад (contribution) и/или ответственное лицо (decision_maker).
   * Компания остаётся без изменений.
   */
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

  /**
   * @param projectId
   * @param companyId
   *
   * @returns Удалить связь проекта с компанией. Компания в базе остаётся, удаляется только запись ProjectCompany.
   */
  deletePartner(projectId: number, companyId: number): Observable<void> {
    return this.apiService.delete<void>(
      `${this.PROJECTS_URL}/${projectId}/companies/${companyId}/`
    );
  }
}
