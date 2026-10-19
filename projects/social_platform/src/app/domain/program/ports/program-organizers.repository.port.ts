/** @format */
import { Observable } from "rxjs";
import {
  ProgramOrganizers,
  OrganizerAccessRemoved,
  OrganizerInvitation,
  OrganizerRegistration,
  OrganizerRegistered,
  InvitationAccepted,
} from "../program-organizers.model";
export abstract class ProgramOrganizersRepositoryPort {
  abstract list(id: number): Observable<ProgramOrganizers>;
  abstract invite(id: number, email: string, revision: string): Observable<ProgramOrganizers>;
  abstract invitationAction(
    id: number,
    invitationId: number,
    action: "resend" | "revoke",
    revision: string,
  ): Observable<ProgramOrganizers>;
  abstract remove(
    id: number,
    userId: number,
    revision: string,
  ): Observable<ProgramOrganizers | OrganizerAccessRemoved>;
  abstract invitation(token: string): Observable<OrganizerInvitation>;
  abstract accept(token: string): Observable<InvitationAccepted>;
  abstract register(token: string, data: OrganizerRegistration): Observable<OrganizerRegistered>;
  abstract resetPassword(token: string, email: string): Observable<void>;
}
