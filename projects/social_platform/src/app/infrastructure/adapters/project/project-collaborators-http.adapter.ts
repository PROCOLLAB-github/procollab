/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ProjectCollaboratorsHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  /**
   * Удаляет коллаборатора из проекта
   *
   * @param projectId - идентификатор проекта
   * @param userId - идентификатор пользователя для удаления из коллабораторов
   * @returns Observable<void> - завершается при успешном удалении коллаборатора
   */
  deleteCollaborator(projectId: number, userId: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/collaborators?id=${userId}`);
  }

  /**
   * Передает лидерство в проекте другому пользователю
   *
   * @param projectId - идентификатор проекта
   * @param userId - идентификатор пользователя, которому передается лидерство
   * @returns Observable<void> - завершается при успешной передаче лидерства
   */
  patchSwitchLeader(projectId: number, userId: number): Observable<void> {
    return this.apiService.patch(
      `${this.PROJECTS_URL}/${projectId}/collaborators/${userId}/switch-leader/`,
      {}
    );
  }

  /**
   * Покидает проект (удаляет текущего пользователя из коллабораторов)
   *
   * @param projectId - идентификатор проекта, который нужно покинуть
   * @returns Observable<void> - завершается при успешном выходе из проекта
   */
  deleteLeave(projectId: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/collaborators/leave`);
  }
}
