/** @format */

import { inject, Injectable } from "@angular/core";
import {
  SolutionRepositoryPort,
  SolutionListQuery,
  SolutionInvitationQuery,
  SolutionRatingQuery,
  SolutionResultsQuery,
  SolutionResultsExportQuery,
  SolutionCabinetQuery,
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
  RateSolutionCommand,
  SolutionAssignmentsWrite,
  SolutionAllocationWrite,
  SolutionQuotaWrite,
} from "@domain/solution/solution-contract.model";
import { SolutionHttpAdapter } from "../../adapters/solution/solution-http.adapter";

@Injectable({ providedIn: "root" })
export class SolutionRepository implements SolutionRepositoryPort {
  caseAnalytics(programId: number) {
    return this.http.caseAnalytics(programId);
  }
  cabinetApplications(query?: SolutionCabinetQuery) {
    return this.http.cabinetApplications(query);
  }
  previewAllocation(programId: number, command: SolutionAllocationWrite) {
    return this.http.previewAllocation(programId, command);
  }
  applyAllocation(programId: number, planToken: string) {
    return this.http.applyAllocation(programId, planToken);
  }
  previewQuota(programId: number, requiredEvaluators: number) {
    return this.http.previewQuota(programId, requiredEvaluators);
  }
  saveQuota(programId: number, command: SolutionQuotaWrite) {
    return this.http.saveQuota(programId, command);
  }
  results(programId: number, query?: SolutionResultsQuery) {
    return this.http.results(programId, query);
  }
  exportResults(programId: number, query?: SolutionResultsExportQuery) {
    return this.http.exportResults(programId, query);
  }
  ratings(programId: number, query?: SolutionRatingQuery) {
    return this.http.ratings(programId, query);
  }
  rating(programId: number, solutionId: number) {
    return this.http.rating(programId, solutionId);
  }
  rate(programId: number, solutionId: number, command: RateSolutionCommand) {
    return this.http.rate(programId, solutionId, command);
  }
  expertAssignments(programId: number, expertId: number) {
    return this.http.expertAssignments(programId, expertId);
  }
  saveExpertAssignments(programId: number, expertId: number, command: SolutionAssignmentsWrite) {
    return this.http.saveExpertAssignments(programId, expertId, command);
  }
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
