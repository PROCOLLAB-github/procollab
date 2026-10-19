/** @format */
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { ProgramOrganizersRepositoryPort } from "@domain/program/ports/program-organizers.repository.port";
import {
  ProgramOrganizers,
  OrganizerAccessRemoved,
  OrganizerInvitation,
  OrganizerRegistration,
  OrganizerRegistered,
  InvitationAccepted,
} from "@domain/program/program-organizers.model";
@Injectable({ providedIn: "root" })
export class ProgramOrganizersHttpAdapter implements ProgramOrganizersRepositoryPort {
  private readonly api = inject(ApiService);
  private root(id: number) {
    return `/programs/${id}/management`;
  }
  private invitationRoot(token: string) {
    return `/programs/organizer-invitations/${encodeURIComponent(token)}`;
  }
  list(id: number): Observable<ProgramOrganizers> {
    return this.api.get(`${this.root(id)}/organizers/`);
  }
  invite(id: number, email: string, revision: string): Observable<ProgramOrganizers> {
    return this.api.post(`${this.root(id)}/organizers/`, { email, revision });
  }
  invitationAction(
    id: number,
    invitationId: number,
    action: "resend" | "revoke",
    revision: string,
  ): Observable<ProgramOrganizers> {
    return this.api.post(`${this.root(id)}/organizer-invitations/${invitationId}/${action}/`, {
      revision,
    });
  }
  remove(
    id: number,
    userId: number,
    revision: string,
  ): Observable<ProgramOrganizers | OrganizerAccessRemoved> {
    return this.api.post(`${this.root(id)}/organizers/${userId}/remove/`, { revision });
  }
  invitation(token: string): Observable<OrganizerInvitation> {
    return this.api.get(`${this.invitationRoot(token)}/`);
  }
  accept(token: string): Observable<InvitationAccepted> {
    return this.api.post(`${this.invitationRoot(token)}/accept/`, {});
  }
  register(token: string, data: OrganizerRegistration): Observable<OrganizerRegistered> {
    return this.api.post(`${this.invitationRoot(token)}/register/`, data);
  }
  resetPassword(token: string, email: string): Observable<void> {
    return this.api.post("/auth/reset_password/", { email, organizerInvitationToken: token });
  }
}
