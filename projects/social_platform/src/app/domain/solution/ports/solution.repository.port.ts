/** @format */

import { Observable } from "rxjs";
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
  UpdateSolutionCommand,
  SolutionUploadResponse,
} from "../solution-contract.model";

export abstract class SolutionRepositoryPort {
  abstract update(
    programId: number,
    solutionId: number,
    command: UpdateSolutionCommand,
  ): Observable<ProgramSolution>;
  abstract upload(file: File): Observable<SolutionUploadResponse>;
  abstract form(programId: number): Observable<SolutionForm>;
  abstract managedForm(programId: number): Observable<SolutionFormManagement>;
  abstract saveManagedForm(
    programId: number,
    command: SolutionFormWrite,
  ): Observable<SolutionFormManagement>;
  abstract templates(): Observable<SolutionTemplates>;
  abstract context(programId: number): Observable<SolutionContext>;
  abstract create(programId: number, command: CreateSolutionCommand): Observable<ProgramSolution>;
  abstract get(programId: number, solutionId: number): Observable<ProgramSolution>;
  abstract list(programId: number, query?: SolutionListQuery): Observable<SolutionPage>;
  abstract removeMember(
    programId: number,
    solutionId: number,
    userId: number,
    expectedSolutionVersion: number,
  ): Observable<SolutionMutationReceipt>;
  abstract leave(
    programId: number,
    solutionId: number,
    command: SolutionTeamCommand,
  ): Observable<void>;
  abstract transferCaptain(
    programId: number,
    solutionId: number,
    command: SolutionCaptainCommand,
  ): Observable<SolutionMutationReceipt>;
  abstract invitations(
    programId: number,
    solutionId: number,
    query?: SolutionInvitationQuery,
  ): Observable<SolutionInvitationPage>;
  abstract createInvitation(
    programId: number,
    solutionId: number,
    command: SolutionCreateInvitation,
  ): Observable<SolutionInvitationCreated>;
  abstract myInvitations(query?: SolutionInvitationQuery): Observable<SolutionInvitationPage>;
  abstract invitation(invitationId: number): Observable<SolutionInvitation>;
  abstract updateInvitation(
    invitationId: number,
    command: SolutionUpdateInvitation,
  ): Observable<SolutionInvitationCreated>;
  abstract revokeInvitation(
    invitationId: number,
    expectedVersion: number,
    expectedSolutionVersion: number,
  ): Observable<void>;
  abstract decideInvitation(
    invitationId: number,
    decision: "accept" | "decline",
    expectedVersion: number,
  ): Observable<SolutionInvitationActionResult>;
}

export type SolutionInvitationQuery = {
  status?: "pending" | "accepted" | "declined";
  limit?: number;
  offset?: number;
};

export type SolutionListQuery = {
  search?: string;
  submission?: "all" | "submitted" | "not_submitted";
  limit?: number;
  offset?: number;
};

export function validSolutionId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
