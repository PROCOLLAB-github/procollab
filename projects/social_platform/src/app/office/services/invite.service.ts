/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { concatMap, map, Observable, take } from "rxjs";
import { plainToInstance } from "class-transformer";
import { Invite } from "@models/invite.model";
import { HttpParams } from "@angular/common/http";
import { AuthService } from "@auth/services";

@Injectable({
  providedIn: "root",
})
export class InviteService {
  constructor(private readonly apiService: ApiService, private readonly authService: AuthService) {}

  sendForUser(
    userId: number,
    projectId: number,
    role: string,
    specialization?: string
  ): Observable<Invite> {
    return this.apiService
      .post("/invites/", { user: userId, project: projectId, role, specialization })
      .pipe(map(profile => plainToInstance(Invite, profile)));
  }

  revokeInvite(invitationId: number): Observable<Invite> {
    return this.apiService.delete(`/invites/${invitationId}`);
  }

  acceptInvite(inviteId: number): Observable<Invite> {
    return this.apiService.post(`/invites/${inviteId}/accept/`, {});
  }

  rejectInvite(inviteId: number): Observable<Invite> {
    return this.apiService.post(`/invites/${inviteId}/decline/`, {});
  }

  updateInvite(inviteId: number, role: string, specialization?: string): Observable<Invite> {
    return this.apiService.patch(`/invites/${inviteId}`, { role, specialization });
  }

  getMy(): Observable<Invite[]> {
    return this.authService.profile.pipe(
      take(1),
      concatMap(profile =>
        this.apiService.get<Invite[]>(
          "/invites/",
          new HttpParams({ fromObject: { user_id: profile.id } })
        )
      ),
      map(invites => plainToInstance(Invite, invites))
    );
  }

  getByProject(projectId: number): Observable<Invite[]> {
    return this.apiService
      .get<Invite[]>(
        "/invites/",
        new HttpParams({ fromObject: { project: projectId, user: "any" } })
      )
      .pipe(map(profiles => plainToInstance(Invite, profiles)));
  }
}
