/** @format */
import { inject, Injectable } from "@angular/core";
import { ProgramOrganizersRepositoryPort } from "@domain/program/ports/program-organizers.repository.port";
import { ProgramOrganizersHttpAdapter } from "../../adapters/program/program-organizers-http.adapter";
@Injectable({ providedIn: "root" })
export class ProgramOrganizersRepository implements ProgramOrganizersRepositoryPort {
  private readonly adapter = inject(ProgramOrganizersHttpAdapter);
  readonly list = this.adapter.list.bind(this.adapter);
  readonly invite = this.adapter.invite.bind(this.adapter);
  readonly invitationAction = this.adapter.invitationAction.bind(this.adapter);
  readonly remove = this.adapter.remove.bind(this.adapter);
  readonly invitation = this.adapter.invitation.bind(this.adapter);
  readonly accept = this.adapter.accept.bind(this.adapter);
  readonly register = this.adapter.register.bind(this.adapter);
  readonly resetPassword = this.adapter.resetPassword.bind(this.adapter);
}
