/** @format */
import { inject, Injectable } from "@angular/core";
import { tap } from "rxjs";
import { ProgramOrganizersRepositoryPort } from "@domain/program/ports/program-organizers.repository.port";
import { OrganizerRegistration } from "@domain/program/program-organizers.model";
import { EventBus } from "@domain/shared/event-bus";
import { ProgramUpdated } from "@domain/program/program-updated.event";
@Injectable({ providedIn: "root" })
export class ProgramOrganizersUseCase {
  private readonly repository = inject(ProgramOrganizersRepositoryPort);
  private readonly events = inject(EventBus);
  private updated(programId: number): void {
    this.events.emit<ProgramUpdated>({
      type: "ProgramUpdated",
      payload: { programId },
      occurredAt: new Date(),
    });
  }
  readonly list = this.repository.list.bind(this.repository);
  readonly invite = this.repository.invite.bind(this.repository);
  readonly invitationAction = this.repository.invitationAction.bind(this.repository);
  readonly invitation = this.repository.invitation.bind(this.repository);
  readonly resetPassword = this.repository.resetPassword.bind(this.repository);
  remove(id: number, userId: number, revision: string) {
    return this.repository.remove(id, userId, revision).pipe(tap(() => this.updated(id)));
  }
  accept(token: string) {
    return this.repository.accept(token).pipe(tap(r => this.updated(r.programId)));
  }
  register(token: string, data: OrganizerRegistration) {
    return this.repository.register(token, data).pipe(tap(r => this.updated(r.programId)));
  }
}
