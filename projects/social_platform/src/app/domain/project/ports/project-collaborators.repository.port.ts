/** @format */

import { Observable } from "rxjs";

export abstract class ProjectCollaboratorsRepositoryPort {
  abstract deleteCollaborator(
    projectId: number,
    userId: number,
    programLinkId?: number,
  ): Observable<void>;
  abstract patchSwitchLeader(
    projectId: number,
    userId: number,
    programLinkId?: number,
  ): Observable<void>;
  abstract deleteLeave(projectId: number, programLinkId?: number): Observable<void>;
}
