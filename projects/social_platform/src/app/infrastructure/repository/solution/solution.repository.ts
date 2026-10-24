/** @format */

import { inject, Injectable } from "@angular/core";
import {
  SolutionRepositoryPort,
  SolutionListQuery,
  SolutionInvitationQuery,
} from "@domain/solution/ports/solution.repository.port";
import {
  CreateSolutionCommand,
  SolutionTeamCommand,
  SolutionCaptainCommand,
  SolutionCreateInvitation,
  SolutionUpdateInvitation,
  SolutionFormWrite,
  UpdateSolutionCommand,
  SubmitSolutionCommand,
} from "@domain/solution/solution-contract.model";
import { SolutionHttpAdapter } from "../../adapters/solution/solution-http.adapter";

@Injectable({ providedIn: "root" })
export class SolutionRepository implements SolutionRepositoryPort {
  submit(programId: number, solutionId: number, command: SubmitSolutionCommand) {
    return this.http.submit(programId, solutionId, command);
  }
  private readonly http = inject(SolutionHttpAdapter);
  update(programId: number, solutionId: number, command: UpdateSolutionCommand) {
    return this.http.update(programId, solutionId, command);
  }
  upload(file: File) {
    return this.http.upload(file);
  }
  form(programId: number) {
    return this.http.form(programId);
  }
  managedForm(programId: number) {
    return this.http.managedForm(programId);
  }
  saveManagedForm(programId: number, command: SolutionFormWrite) {
    return this.http.saveManagedForm(programId, command);
  }
  templates() {
    return this.http.templates();
  }
  context(programId: number) {
    return this.http.context(programId);
  }
  create(programId: number, command: CreateSolutionCommand) {
    return this.http.create(programId, command);
  }
  get(programId: number, solutionId: number) {
    return this.http.get(programId, solutionId);
  }
  list(programId: number, query?: SolutionListQuery) {
    return this.http.list(programId, query);
  }
  removeMember(
    programId: number,
    solutionId: number,
    userId: number,
    expectedSolutionVersion: number,
  ) {
    return this.http.removeMember(programId, solutionId, userId, expectedSolutionVersion);
  }
  leave(programId: number, solutionId: number, command: SolutionTeamCommand) {
    return this.http.leave(programId, solutionId, command);
  }
  transferCaptain(programId: number, solutionId: number, command: SolutionCaptainCommand) {
    return this.http.transferCaptain(programId, solutionId, command);
  }
  invitations(programId: number, solutionId: number, query?: SolutionInvitationQuery) {
    return this.http.invitations(programId, solutionId, query);
  }
  createInvitation(programId: number, solutionId: number, command: SolutionCreateInvitation) {
    return this.http.createInvitation(programId, solutionId, command);
  }
  myInvitations(query?: SolutionInvitationQuery) {
    return this.http.myInvitations(query);
  }
  invitation(invitationId: number) {
    return this.http.invitation(invitationId);
  }
  updateInvitation(invitationId: number, command: SolutionUpdateInvitation) {
    return this.http.updateInvitation(invitationId, command);
  }
  revokeInvitation(invitationId: number, expectedVersion: number, expectedSolutionVersion: number) {
    return this.http.revokeInvitation(invitationId, expectedVersion, expectedSolutionVersion);
  }
  decideInvitation(invitationId: number, decision: "accept" | "decline", expectedVersion: number) {
    return this.http.decideInvitation(invitationId, decision, expectedVersion);
  }
}
