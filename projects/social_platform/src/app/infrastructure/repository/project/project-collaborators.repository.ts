/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ProjectCollaboratorsRepositoryPort } from "@domain/project/ports/project-collaborators.repository.port";
import { ProjectCollaboratorsHttpAdapter } from "../../adapters/project/project-collaborators-http.adapter";

/** Репозиторий участников проекта: удаление, смена лидера, выход. */
@Injectable({ providedIn: "root" })
export class ProjectCollaboratorsRepository implements ProjectCollaboratorsRepositoryPort {
  private readonly projectCollaboratorsAdapter = inject(ProjectCollaboratorsHttpAdapter);

  deleteCollaborator(projectId: number, userId: number, programLinkId?: number): Observable<void> {
    return this.projectCollaboratorsAdapter.deleteCollaborator(
      projectId,
      userId,
      ...[programLinkId].filter((id): id is number => id !== undefined),
    );
  }

  patchSwitchLeader(projectId: number, userId: number, programLinkId?: number): Observable<void> {
    return this.projectCollaboratorsAdapter.patchSwitchLeader(
      projectId,
      userId,
      ...[programLinkId].filter((id): id is number => id !== undefined),
    );
  }

  deleteLeave(projectId: number, programLinkId?: number): Observable<void> {
    return this.projectCollaboratorsAdapter.deleteLeave(
      projectId,
      ...[programLinkId].filter((id): id is number => id !== undefined),
    );
  }
}
