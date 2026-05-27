/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";

/** HTTP-адаптер участников проекта: `/projects/<id>/collaborators` (удаление, смена лидера, выход). */
@Injectable({ providedIn: "root" })
export class ProjectCollaboratorsHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  deleteCollaborator(projectId: number, userId: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/collaborators?id=${userId}/`);
  }

  patchSwitchLeader(projectId: number, userId: number): Observable<void> {
    return this.apiService.patch(
      `${this.PROJECTS_URL}/${projectId}/collaborators/${userId}/switch-leader/`,
      {}
    );
  }

  deleteLeave(projectId: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/collaborators/leave/`);
  }
}
