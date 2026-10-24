/** @format */

import { inject, Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import {
  CreateSolutionCommand,
  ProgramSolution,
  SolutionContext,
  SolutionPage,
  SolutionCaptainCommand,
  SolutionTeamCommand,
  SolutionMutationReceipt,
  SolutionInvitation,
  SolutionInvitationPage,
  SolutionCreateInvitation,
  SolutionUpdateInvitation,
  SolutionInvitationCreated,
  SolutionInvitationActionResult,
  SolutionForm,
  SolutionFormWrite,
  SolutionFormManagement,
  SolutionTemplates,
} from "@domain/solution/solution-contract.model";
import {
  SolutionListQuery,
  SolutionInvitationQuery,
  validSolutionId,
} from "@domain/solution/ports/solution.repository.port";

@Injectable({ providedIn: "root" })
export class SolutionHttpAdapter {
  private readonly api = inject(ApiService);

  private path(programId: number): string {
    if (!validSolutionId(programId)) throw new RangeError("Invalid program ID");
    return `/programs/${programId}/solutions/`;
  }

  private formPath(programId: number, management = false): string {
    if (!validSolutionId(programId)) throw new RangeError("Invalid program ID");
    return `/programs/${programId}/${management ? "management/" : ""}solution-form/`;
  }
  form(programId: number) {
    return this.api.get<SolutionForm>(this.formPath(programId));
  }
  managedForm(programId: number) {
    return this.api.get<SolutionFormManagement>(this.formPath(programId, true));
  }
  saveManagedForm(programId: number, command: SolutionFormWrite) {
    return this.api.put<SolutionFormManagement>(this.formPath(programId, true), command);
  }
  templates() {
    return this.api.get<SolutionTemplates>("/solution-form-templates/");
  }

  context(programId: number) {
    this.path(programId);
    return this.api.get<SolutionContext>(`/programs/${programId}/solution-context/`);
  }

  create(programId: number, command: CreateSolutionCommand) {
    return this.api.post<ProgramSolution>(this.path(programId), command);
  }

  get(programId: number, solutionId: number) {
    if (!validSolutionId(solutionId)) throw new RangeError("Invalid solution ID");
    return this.api.get<ProgramSolution>(`${this.path(programId)}${solutionId}/`);
  }

  list(programId: number, query: SolutionListQuery = {}) {
    let params = new HttpParams();
    // Query string не проходит через CamelcaseInterceptor; имена уже из C00.
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params = params.set(key, value);
    }
    return this.api.get<SolutionPage>(this.path(programId), params);
  }

  private solutionPath(programId: number, solutionId: number): string {
    if (!validSolutionId(solutionId)) throw new RangeError("Invalid solution ID");
    return `${this.path(programId)}${solutionId}/`;
  }

  private invitationPath(invitationId: number): string {
    if (!validSolutionId(invitationId)) throw new RangeError("Invalid invitation ID");
    return `/solution-invitations/${invitationId}/`;
  }

  private invitationQuery(query: SolutionInvitationQuery = {}): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params = params.set(key, value);
    }
    return params;
  }

  removeMember(
    programId: number,
    solutionId: number,
    userId: number,
    expectedSolutionVersion: number,
  ) {
    if (!validSolutionId(userId)) throw new RangeError("Invalid member ID");
    return this.api.delete<SolutionMutationReceipt>(
      `${this.solutionPath(programId, solutionId)}members/${userId}/`,
      new HttpParams().set("expected_solution_version", expectedSolutionVersion),
    );
  }

  leave(programId: number, solutionId: number, command: SolutionTeamCommand) {
    return this.api.post<void>(`${this.solutionPath(programId, solutionId)}leave/`, command);
  }

  transferCaptain(programId: number, solutionId: number, command: SolutionCaptainCommand) {
    return this.api.post<SolutionMutationReceipt>(
      `${this.solutionPath(programId, solutionId)}captain/`,
      command,
    );
  }

  invitations(programId: number, solutionId: number, query?: SolutionInvitationQuery) {
    return this.api.get<SolutionInvitationPage>(
      `${this.solutionPath(programId, solutionId)}invitations/`,
      this.invitationQuery(query),
    );
  }

  createInvitation(programId: number, solutionId: number, command: SolutionCreateInvitation) {
    return this.api.post<SolutionInvitationCreated>(
      `${this.solutionPath(programId, solutionId)}invitations/`,
      command,
    );
  }

  myInvitations(query?: SolutionInvitationQuery) {
    return this.api.get<SolutionInvitationPage>(
      "/solution-invitations/",
      this.invitationQuery(query),
    );
  }

  invitation(invitationId: number) {
    return this.api.get<SolutionInvitation>(this.invitationPath(invitationId));
  }

  updateInvitation(invitationId: number, command: SolutionUpdateInvitation) {
    return this.api.patch<SolutionInvitationCreated>(this.invitationPath(invitationId), command);
  }

  revokeInvitation(invitationId: number, expectedVersion: number, expectedSolutionVersion: number) {
    return this.api.delete<void>(
      this.invitationPath(invitationId),
      new HttpParams()
        .set("expected_version", expectedVersion)
        .set("expected_solution_version", expectedSolutionVersion),
    );
  }

  decideInvitation(invitationId: number, decision: "accept" | "decline", expectedVersion: number) {
    return this.api.post<SolutionInvitationActionResult>(
      `${this.invitationPath(invitationId)}${decision}/`,
      { expectedVersion },
    );
  }
}
