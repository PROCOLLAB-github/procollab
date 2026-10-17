/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";

/** HTTP-адаптер участников проекта: `/projects/<id>/collaborators` (удаление, смена лидера, выход). */
@Injectable({ providedIn: "root" })
export class ProjectCollaboratorsHttpAdapter {
  private readonly PROJECTS_URL = "/projects";
  private readonly apiService = inject(ApiService);

  deleteCollaborator(projectId: number, userId: number, programLinkId?: number): Observable<void> {
    return this.apiService.delete(
      `${this.PROJECTS_URL}/${projectId}/collaborators/?id=${userId}${programLinkId !== undefined ? `&program_link_id=${programLinkId}` : ""}`,
    );
  }

  patchSwitchLeader(projectId: number, userId: number, programLinkId?: number): Observable<void> {
    return this.apiService.patch(
      `${this.PROJECTS_URL}/${projectId}/collaborators/${userId}/switch-leader/`,
      programLinkId !== undefined ? { programLinkId } : {},
    );
  }

  deleteLeave(projectId: number, programLinkId?: number): Observable<void> {
    return this.apiService.delete(
      `${this.PROJECTS_URL}/${projectId}/collaborators/leave/${programLinkId !== undefined ? `?program_link_id=${programLinkId}` : ""}`,
    );
  }
}
