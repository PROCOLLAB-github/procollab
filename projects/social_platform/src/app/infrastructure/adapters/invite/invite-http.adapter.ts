/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { Invite } from "@domain/invite/invite.model";
import { HttpParams } from "@angular/common/http";

/** HTTP-адаптер приглашений: выполняет сетевые операции без доменного маппинга. */
@Injectable({ providedIn: "root" })
export class InviteHttpAdapter {
  private readonly INVITES_URL = "/invites";
  private readonly apiService = inject(ApiService);

  sendForUser(
    userId: number,
    projectId: number,
    role: string,
    specialization?: string,
  ): Observable<Invite> {
    return this.apiService.post(`${this.INVITES_URL}/`, {
      user: userId,
      project: projectId,
      role,
      specialization,
    });
  }

  revokeInvite(invitationId: number): Observable<void> {
    return this.apiService.delete(`${this.INVITES_URL}/${invitationId}/`);
  }

  acceptInvite(inviteId: number): Observable<Invite> {
    return this.apiService.post(`${this.INVITES_URL}/${inviteId}/accept/`, {});
  }

  rejectInvite(inviteId: number): Observable<Invite> {
    return this.apiService.post(`${this.INVITES_URL}/${inviteId}/decline/`, {});
  }

  updateInvite(inviteId: number, role: string, specialization?: string): Observable<Invite> {
    return this.apiService.patch(`${this.INVITES_URL}/${inviteId}/`, { role, specialization });
  }

  getMy(): Observable<Invite[]> {
    return this.apiService.get<Invite[]>(`${this.INVITES_URL}/`);
  }

  getByProject(projectId: number): Observable<Invite[]> {
    return this.apiService.get<Invite[]>(
      `${this.INVITES_URL}/`,
      new HttpParams({ fromObject: { project: projectId, user: "any" } }),
    );
  }
}
