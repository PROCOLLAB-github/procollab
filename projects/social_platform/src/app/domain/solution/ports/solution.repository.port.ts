/** @format */

import { Observable } from "rxjs";
import {
  SolutionCaseChangePreviewRequest,
  SolutionCaseChangeApplyRequest,
  SolutionCaseChangePreview,
  SolutionActionPreviewRequest,
  SolutionActionApplyRequest,
  SolutionActionPreview,
  SolutionActionResult,
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
  SubmitSolutionCommand,
  RateSolutionCommand,
  SolutionRatingPage,
  SolutionRatingFrame,
  SolutionAssignmentOptions,
  SolutionAssignmentsWrite,
  SolutionAllocationWrite,
  SolutionAllocationPlan,
  SolutionAssignmentReceipt,
  SolutionQuota,
  SolutionQuotaWrite,
  SolutionResults,
  SolutionCabinetApplications,
  SolutionCaseSolutionAnalytics,
  SolutionManagerAnalytics,
  SolutionManagerAssignments,
  SolutionManagerAssignmentDetail,
  SolutionManagerSolutions,
  SolutionReminderPreviewRequest,
  SolutionReminderPreview,
  SolutionReminderReceipt,
  SolutionPublishedSolution,
  SolutionPublishedSolutionPage,
} from "../solution-contract.model";

export abstract class SolutionRepositoryPort {
  abstract previewCaseChange(
    programId: number,
    solutionId: number,
    command: SolutionCaseChangePreviewRequest,
  ): Observable<SolutionCaseChangePreview>;
  abstract applyCaseChange(
    programId: number,
    solutionId: number,
    command: SolutionCaseChangeApplyRequest,
  ): Observable<SolutionMutationReceipt>;
  abstract previewSubmitAction(
    programId: number,
    command: SolutionActionPreviewRequest,
  ): Observable<SolutionActionPreview>;
  abstract applySubmitAction(
    programId: number,
    command: SolutionActionApplyRequest,
  ): Observable<SolutionActionResult>;
  abstract publishedSolutions(
    programId: number,
    query?: SolutionPublishedQuery,
  ): Observable<SolutionPublishedSolutionPage>;
  abstract publishedSolution(
    programId: number,
    solutionId: number,
  ): Observable<SolutionPublishedSolution>;
  abstract previewExpertReminder(
    programId: number,
    command: SolutionReminderPreviewRequest,
  ): Observable<SolutionReminderPreview>;
  abstract confirmExpertReminder(
    programId: number,
    token: string,
  ): Observable<SolutionReminderReceipt>;
  abstract managerAnalytics(programId: number): Observable<SolutionManagerAnalytics>;
  abstract managerAssignments(
    programId: number,
    query?: SolutionManagerAssignmentQuery,
  ): Observable<SolutionManagerAssignments>;
  abstract managerAssignment(
    programId: number,
    assignmentId: number,
  ): Observable<SolutionManagerAssignmentDetail>;
  abstract managerSolutions(
    programId: number,
    query?: SolutionManagerSolutionsQuery,
  ): Observable<SolutionManagerSolutions>;
  abstract exportAnalytics(
    programId: number,
    query?: SolutionAnalyticsExportQuery,
  ): Observable<Blob>;
  abstract caseAnalytics(programId: number): Observable<SolutionCaseSolutionAnalytics>;
  abstract cabinetApplications(
    query?: SolutionCabinetQuery,
  ): Observable<SolutionCabinetApplications>;
  abstract previewAllocation(
    programId: number,
    command: SolutionAllocationWrite,
  ): Observable<SolutionAllocationPlan>;
  abstract applyAllocation(
    programId: number,
    planToken: string,
  ): Observable<SolutionAssignmentReceipt>;
  abstract previewQuota(programId: number, requiredEvaluators: number): Observable<SolutionQuota>;
  abstract saveQuota(programId: number, command: SolutionQuotaWrite): Observable<SolutionQuota>;
  abstract results(programId: number, query?: SolutionResultsQuery): Observable<SolutionResults>;
  abstract exportResults(programId: number, query?: SolutionResultsExportQuery): Observable<Blob>;
  abstract ratings(programId: number, query?: SolutionRatingQuery): Observable<SolutionRatingPage>;
  abstract rating(programId: number, solutionId: number): Observable<SolutionRatingFrame>;
  abstract rate(
    programId: number,
    solutionId: number,
    command: RateSolutionCommand,
  ): Observable<SolutionRatingFrame>;
  abstract expertAssignments(
    programId: number,
    expertId: number,
  ): Observable<SolutionAssignmentOptions>;
  abstract saveExpertAssignments(
    programId: number,
    expertId: number,
    command: SolutionAssignmentsWrite,
  ): Observable<SolutionAssignmentOptions>;
  abstract submit(
    programId: number,
    solutionId: number,
    command: SubmitSolutionCommand,
  ): Observable<ProgramSolution>;
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

export type SolutionPublishedQuery = Pick<SolutionListQuery, "limit" | "offset" | "search">;

export type SolutionRatingQuery = {
  search?: string;
  caseScope?: "all" | "selected" | "without_case";
  caseName?: string;
  status?: "all" | "pending" | "completed";
  assignedOnly?: boolean;
  limit?: number;
  offset?: number;
};

export type SolutionResultsQuery = {
  search?: string;
  caseScope?: "all" | "selected" | "without_case";
  caseName?: string;
  order?: "asc" | "desc";
  status?: "all" | "complete" | "pending";
};

export type SolutionResultsExportQuery = SolutionResultsQuery & {
  scope?: "current" | "all";
};

export type SolutionCabinetQuery = {
  status?: "pending" | "completed";
  q?: string;
  programId?: number;
  limit?: number;
  offset?: number;
};

export type SolutionManagerAssignmentQuery = {
  scope?: "all" | "completed" | "pending";
};

export type SolutionManagerSolutionFilters = {
  search?: string;
  scope?: "all" | "not_submitted" | "awaiting_evaluation";
  submission?: "all" | "submitted" | "not_submitted";
  caseScope?: "all" | "selected" | "without_case";
  caseName?: string;
  fieldId?: number;
  answerState?: "all" | "present" | "missing" | "not_applicable";
};

export type SolutionManagerSolutionsQuery = SolutionManagerSolutionFilters & {
  limit?: number;
  offset?: number;
};

export type SolutionAnalyticsExportQuery = { limit?: never; offset?: never } & (
  | ({ kind?: "program" | "solutions" | "submitted" | "scores" } & {
      [Key in keyof SolutionManagerSolutionFilters]?: never;
    })
  | ({ kind: "solutions" | "submitted" } & SolutionManagerSolutionFilters)
);

export function validSolutionId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
