/** @format */

import { Observable } from "rxjs";

export abstract class ProjectCollaboratorsRepositoryPort {
  abstract deleteCollaborator(projectId: number, userId: number): Observable<void>;
  abstract patchSwitchLeader(projectId: number, userId: number): Observable<void>;
  abstract deleteLeave(projectId: number): Observable<void>;
}
