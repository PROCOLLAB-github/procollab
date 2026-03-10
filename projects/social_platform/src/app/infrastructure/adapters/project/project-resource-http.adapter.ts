/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { Resource, ResourceDto } from "../../../domain/project/resource.model";

@Injectable({ providedIn: "root" })
export class ProjectResourceHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  /**
   *
   * @param id
   * @param params
   * @returns Создать новый ресурс в проекте.
   * Если partner_company указана, проверяется, что она действительно является партнёром данного проекта.
   */
  addResource(projectId: number, params: Omit<ResourceDto, "projectId">): Observable<Resource> {
    return this.apiService.post(`${this.PROJECTS_URL}/${projectId}/resources/`, {
      projectId,
      ...params,
    });
  }

  /**
   *
   * @param id
   * @returns Получить список всех ресурсов проекта.
   * Каждый ресурс содержит тип, описание и партнёра (если назначен)
   */
  getResources(id: number): Observable<Resource[]> {
    return this.apiService.get(`${this.PROJECTS_URL}/${id}/resources/`);
  }

  /**
   * @param projectId
   * @param resourceId
   *
   * @returns Полностью обновить данные ресурса.
   * Используется, если нужно заменить все поля сразу.
   */
  editResource(
    projectId: number,
    resourceId: number,
    params: Omit<ResourceDto, "projectId">
  ): Observable<Resource> {
    return this.apiService.patch(`${this.PROJECTS_URL}/${projectId}/resources/${resourceId}/`, {
      projectId,
      ...params,
    });
  }

  /**
   * @param projectId
   * @param resourceId
   *
   * @returns Удалить ресурс проекта.
   * Удаляется только сам ресурс, проект и компании не затрагиваются.
   */
  deleteResource(projectId: number, resourceId: number): Observable<void> {
    return this.apiService.delete<void>(
      `${this.PROJECTS_URL}/${projectId}/resources/${resourceId}/`
    );
  }
}
