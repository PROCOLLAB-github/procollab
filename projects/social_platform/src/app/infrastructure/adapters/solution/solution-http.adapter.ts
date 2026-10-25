/** @format */

import { inject, Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
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
} from "@domain/solution/solution-contract.model";
import {
  SolutionListQuery,
  SolutionInvitationQuery,
  SolutionRatingQuery,
  SolutionResultsQuery,
  SolutionResultsExportQuery,
  SolutionCabinetQuery,
  SolutionManagerAssignmentQuery,
  SolutionManagerSolutionsQuery,
  SolutionAnalyticsExportQuery,
  SolutionPublishedQuery,
  validSolutionId,
} from "@domain/solution/ports/solution.repository.port";

@Injectable({ providedIn: "root" })
export class SolutionHttpAdapter {
  private caseActionPath(programId: number, solutionId: number) {
    this.path(programId);
    if (!validSolutionId(solutionId)) throw new RangeError("Invalid solution ID");
    return `/programs/${programId}/management/solutions/${solutionId}/case/`;
  }
  previewCaseChange(
    programId: number,
    solutionId: number,
    command: SolutionCaseChangePreviewRequest,
  ) {
    return this.api.post<SolutionCaseChangePreview>(
      `${this.caseActionPath(programId, solutionId)}preview/`,
      command,
    );
  }
  applyCaseChange(programId: number, solutionId: number, command: SolutionCaseChangeApplyRequest) {
    return this.api.post<SolutionMutationReceipt>(
      `${this.caseActionPath(programId, solutionId)}apply/`,
      command,
    );
  }
  private submissionActionPath(programId: number, ids: number[]) {
    this.path(programId);
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.length > 10000 ||
      !ids.every(validSolutionId)
    ) {
      throw new RangeError("Выберите корректные решения.");
    }
    return `/programs/${programId}/management/solutions/actions/`;
  }
  previewSubmitAction(programId: number, command: SolutionActionPreviewRequest) {
    return this.api.post<SolutionActionPreview>(
      `${this.submissionActionPath(programId, command.ids)}preview/`,
      command,
    );
  }
  applySubmitAction(programId: number, command: SolutionActionApplyRequest) {
    return this.api.post<SolutionActionResult>(
      `${this.submissionActionPath(programId, command.ids)}apply/`,
      command,
    );
  }
  private publishedPath(programId: number) {
    this.path(programId);
    return `/programs/${programId}/published-solutions/`;
  }
  publishedSolutions(programId: number, query: SolutionPublishedQuery = {}) {
    return this.api.get<SolutionPublishedSolutionPage>(
      this.publishedPath(programId),
      this.evaluationQuery(query),
    );
  }
  publishedSolution(programId: number, solutionId: number) {
    if (!validSolutionId(solutionId)) throw new RangeError("Некорректный ID решения.");
    return this.api.get<SolutionPublishedSolution>(
      `${this.publishedPath(programId)}${solutionId}/`,
    );
  }
  private expertReminderPath(programId: number) {
    return `${this.analyticsPath(programId)}attention/solutions-awaiting-evaluation/`;
  }
  previewExpertReminder(programId: number, command: SolutionReminderPreviewRequest) {
    return this.api.post<SolutionReminderPreview>(
      `${this.expertReminderPath(programId)}reminder-preview/`,
      command,
    );
  }
  confirmExpertReminder(programId: number, token: string) {
    return this.api.post<SolutionReminderReceipt>(
      `${this.expertReminderPath(programId)}reminders/`,
      { token },
    );
  }
  private analyticsPath(programId: number) {
    this.path(programId);
    return `/programs/${programId}/management/solution-analytics/`;
  }
  managerAnalytics(programId: number) {
    return this.api.get<SolutionManagerAnalytics>(this.analyticsPath(programId));
  }
  managerAssignments(programId: number, query: SolutionManagerAssignmentQuery = {}) {
    return this.api.get<SolutionManagerAssignments>(
      `${this.analyticsPath(programId)}assignments/`,
      this.evaluationQuery(query),
    );
  }
  managerAssignment(programId: number, assignmentId: number) {
    if (!validSolutionId(assignmentId)) throw new RangeError("Invalid assignment ID");
    return this.api.get<SolutionManagerAssignmentDetail>(
      `${this.analyticsPath(programId)}assignments/${assignmentId}/`,
    );
  }
  managerSolutions(programId: number, query: SolutionManagerSolutionsQuery = {}) {
    return this.api.get<SolutionManagerSolutions>(
      `${this.analyticsPath(programId)}solutions/`,
      this.managerQuery(query),
    );
  }
  exportAnalytics(programId: number, query: SolutionAnalyticsExportQuery = {}) {
    return this.api.getFile(`${this.analyticsPath(programId)}export/`, this.managerQuery(query));
  }
  private managerQuery(query: SolutionManagerSolutionsQuery | SolutionAnalyticsExportQuery) {
    if (query.fieldId !== undefined && !validSolutionId(query.fieldId)) {
      throw new RangeError("Invalid field ID");
    }
    return this.evaluationQuery(query);
  }
  caseAnalytics(programId: number) {
    this.path(programId);
    return this.api.get<SolutionCaseSolutionAnalytics>(
      `/programs/${programId}/management/solution-cases/`,
    );
  }
  cabinetApplications(query: SolutionCabinetQuery = {}) {
    return this.api.get<SolutionCabinetApplications>(
      "/evaluation/applications/",
      this.evaluationQuery(query),
    );
  }
  private evaluationManagementPath(programId: number) {
    this.path(programId);
    return `/programs/${programId}/management/solution-evaluation/`;
  }
  previewAllocation(programId: number, command: SolutionAllocationWrite) {
    return this.api.post<SolutionAllocationPlan>(
      `${this.evaluationManagementPath(programId)}allocation/`,
      command,
    );
  }
  applyAllocation(programId: number, planToken: string) {
    return this.api.post<SolutionAssignmentReceipt>(
      `${this.evaluationManagementPath(programId)}allocation/apply/`,
      { planToken },
    );
  }
  previewQuota(programId: number, requiredEvaluators: number) {
    return this.api.get<SolutionQuota>(
      `${this.evaluationManagementPath(programId)}quota/`,
      new HttpParams().set("required_evaluators", requiredEvaluators),
    );
  }
  saveQuota(programId: number, command: SolutionQuotaWrite) {
    return this.api.put<SolutionQuota>(
      `${this.evaluationManagementPath(programId)}quota/`,
      command,
    );
  }
  results(programId: number, query: SolutionResultsQuery = {}) {
    this.path(programId);
    return this.api.get<SolutionResults>(
      `/programs/${programId}/management/solution-results/`,
      this.evaluationQuery(query),
    );
  }
  exportResults(programId: number, query: SolutionResultsExportQuery = {}) {
    this.path(programId);
    return this.api.getFile(
      `/programs/${programId}/management/solution-results/export/`,
      this.evaluationQuery(query),
    );
  }
  private evaluationQuery(
    query:
      | SolutionRatingQuery
      | SolutionResultsQuery
      | SolutionCabinetQuery
      | SolutionManagerAssignmentQuery
      | SolutionManagerSolutionsQuery
      | SolutionAnalyticsExportQuery,
  ) {
    let params = new HttpParams();
    const wireKeys: Record<string, string> = {
      caseScope: "case_scope",
      caseName: "case_name",
      assignedOnly: "assigned_only",
      programId: "program_id",
      fieldId: "field_id",
      answerState: "answer_state",
    };
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) params = params.set(wireKeys[key] ?? key, value);
    }
    return params;
  }
  ratings(programId: number, query: SolutionRatingQuery = {}) {
    this.path(programId);
    return this.api.get<SolutionRatingPage>(
      `/programs/${programId}/solution-evaluation/`,
      this.evaluationQuery(query),
    );
  }
  rating(programId: number, solutionId: number) {
    return this.api.get<SolutionRatingFrame>(
      `${this.solutionPath(programId, solutionId)}evaluation/`,
    );
  }
  rate(programId: number, solutionId: number, command: RateSolutionCommand) {
    return this.api.post<SolutionRatingFrame>(
      `${this.solutionPath(programId, solutionId)}evaluation/`,
      command,
    );
  }
  private expertAssignmentsPath(programId: number, expertId: number) {
    this.path(programId);
    if (!validSolutionId(expertId)) throw new RangeError("Invalid expert ID");
    return `/programs/${programId}/management/solution-evaluation/experts/${expertId}/assignments/`;
  }
  expertAssignments(programId: number, expertId: number) {
    return this.api.get<SolutionAssignmentOptions>(this.expertAssignmentsPath(programId, expertId));
  }
  saveExpertAssignments(programId: number, expertId: number, command: SolutionAssignmentsWrite) {
    return this.api.put<SolutionAssignmentOptions>(
      this.expertAssignmentsPath(programId, expertId),
      command,
    );
  }
  submit(programId: number, solutionId: number, command: SubmitSolutionCommand) {
    return this.api.post<ProgramSolution>(
      `${this.solutionPath(programId, solutionId)}submit/`,
      command,
    );
  }
  private readonly api = inject(ApiService);
  update(programId: number, solutionId: number, command: UpdateSolutionCommand) {
    return this.api.patch<ProgramSolution>(this.solutionPath(programId, solutionId), command);
  }
  upload(file: File) {
    const body = new FormData();
    body.append("file", file, file.name);
    return this.api.post<SolutionUploadResponse>("/files/?preserve_original=true", body);
  }

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
