/** @format */
import { inject, Injectable } from "@angular/core";
import { EvaluationRepositoryPort } from "@domain/program/ports/evaluation.repository.port";
import { EventBus } from "@domain/shared/event-bus";
import { ProgramUpdated } from "@domain/program/program-updated.event";
import { ExpertRegistration, ExpertsBulkWrite } from "@domain/program/evaluation-workspace.model";
import { tap } from "rxjs";
@Injectable({ providedIn: "root" })
export class EvaluationUseCase {
  private readonly repository = inject(EvaluationRepositoryPort);
  private readonly events = inject(EventBus);
  private updated(programId: number): void {
    this.events.emit<ProgramUpdated>({
      type: "ProgramUpdated",
      payload: { programId },
      occurredAt: new Date(),
    });
  }
  readonly programs = this.repository.programs.bind(this.repository);
  readonly workspace = this.repository.workspace.bind(this.repository);
  bulkExperts(id: number, data: ExpertsBulkWrite) {
    return this.repository.bulkExperts(id, data);
  }
  readonly saveCaseScope = this.repository.saveCaseScope.bind(this.repository);
  readonly saveInvitationCaseScope = this.repository.saveInvitationCaseScope.bind(this.repository);
  readonly saveProjectExperts = this.repository.saveProjectExperts.bind(this.repository);
  readonly invite = this.repository.invite.bind(this.repository);
  readonly invitationAction = this.repository.invitationAction.bind(this.repository);
  readonly assignments = this.repository.assignments.bind(this.repository);
  readonly saveAssignments = this.repository.saveAssignments.bind(this.repository);
  readonly allocation = this.repository.allocation.bind(this.repository);
  readonly applyAllocation = this.repository.applyAllocation.bind(this.repository);
  readonly quota = this.repository.quota.bind(this.repository);
  readonly saveQuota = this.repository.saveQuota.bind(this.repository);
  readonly invitation = this.repository.invitation.bind(this.repository);
  accept(token: string) {
    return this.repository.accept(token).pipe(tap(r => this.updated(r.programId)));
  }
  acceptOwn(id: number) {
    return this.repository.acceptOwn(id).pipe(tap(r => this.updated(r.programId)));
  }
  register(token: string, data: ExpertRegistration) {
    return this.repository.register(token, data).pipe(tap(r => this.updated(r.programId)));
  }
  readonly resetPassword = this.repository.resetPassword.bind(this.repository);
}
