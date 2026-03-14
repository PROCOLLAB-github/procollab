/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ProjectCollaboratorsRepositoryPort } from "../../../domain/project/ports/project-collaborators.repository.port";
import { ProjectCollaboratorsHttpAdapter } from "../../adapters/project/project-collaborators-http.adapter";

@Injectable({ providedIn: "root" })
export class ProjectCollaboratorsRepository implements ProjectCollaboratorsRepositoryPort {
  private readonly projectCollaboratorsAdapter = inject(ProjectCollaboratorsHttpAdapter);

  deleteCollaborator(projectId: number, userId: number): Observable<void> {
    return this.projectCollaboratorsAdapter.deleteCollaborator(projectId, userId);
  }

  patchSwitchLeader(projectId: number, userId: number): Observable<void> {
    return this.projectCollaboratorsAdapter.patchSwitchLeader(projectId, userId);
  }

  deleteLeave(projectId: number): Observable<void> {
    return this.projectCollaboratorsAdapter.deleteLeave(projectId);
  }
}
