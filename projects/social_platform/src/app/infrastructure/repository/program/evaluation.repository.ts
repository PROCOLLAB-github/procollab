/** @format */
import { inject, Injectable } from "@angular/core";
import { EvaluationHttpAdapter } from "../../adapters/program/evaluation-http.adapter";
import { EvaluationRepositoryPort } from "@domain/program/ports/evaluation.repository.port";
@Injectable({ providedIn: "root" })
export class EvaluationRepository implements EvaluationRepositoryPort {
  private readonly adapter = inject(EvaluationHttpAdapter);
  readonly programs = this.adapter.programs.bind(this.adapter);
  readonly workspace = this.adapter.workspace.bind(this.adapter);
  readonly invite = this.adapter.invite.bind(this.adapter);
  readonly invitationAction = this.adapter.invitationAction.bind(this.adapter);
  readonly assignments = this.adapter.assignments.bind(this.adapter);
  readonly saveAssignments = this.adapter.saveAssignments.bind(this.adapter);
  readonly allocation = this.adapter.allocation.bind(this.adapter);
  readonly applyAllocation = this.adapter.applyAllocation.bind(this.adapter);
  readonly quota = this.adapter.quota.bind(this.adapter);
  readonly saveQuota = this.adapter.saveQuota.bind(this.adapter);
  readonly invitation = this.adapter.invitation.bind(this.adapter);
  readonly accept = this.adapter.accept.bind(this.adapter);
  readonly acceptOwn = this.adapter.acceptOwn.bind(this.adapter);
  readonly register = this.adapter.register.bind(this.adapter);
  readonly resetPassword = this.adapter.resetPassword.bind(this.adapter);
}
