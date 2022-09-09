/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { map, Observable } from "rxjs";
import { User } from "../../auth/models/user.model";
import { plainToClass } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class InviteService {
  constructor(private apiService: ApiService) {}

  sendForUser(userId: number, projectId: number): Observable<User> {
    return this.apiService
      .post("/invite/send", { userId, projectId })
      .pipe(map(profile => plainToClass(User, profile)));
  }

  revokeInvite(invitationId: number): Observable<void> {
    return this.apiService.delete(`/invite/revoke/${invitationId}`);
  }

  getByProject(projectId: number): Observable<User[]> {
    return this.apiService
      .get<User[]>(`/invite/all/${projectId}`)
      .pipe(map(profiles => plainToClass(User, profiles)));
  }
}
