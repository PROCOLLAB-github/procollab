/** @format */
import { Observable } from "rxjs";
import {
  EvaluationPrograms,
  ExpertWorkspace,
  AssignmentOptions,
  AllocationQuery,
  AllocationPlan,
  QuotaPreview,
  ExpertInvitation,
  InvitationAccepted,
  ExpertRegistration,
  ExpertRegistered,
  ExpertCaseScopeWrite,
  ProjectExpertsWrite,
} from "@domain/program/evaluation-workspace.model";
export abstract class EvaluationRepositoryPort {
  abstract programs(): Observable<EvaluationPrograms>;
  abstract workspace(id: number): Observable<ExpertWorkspace>;
  abstract saveCaseScope(
    id: number,
    expertId: number,
    data: ExpertCaseScopeWrite,
  ): Observable<ExpertWorkspace>;
  abstract saveProjectExperts(id: number, data: ProjectExpertsWrite): Observable<ExpertWorkspace>;
  abstract invite(
    id: number,
    email: string,
    scope?: Omit<ExpertCaseScopeWrite, "revision">,
  ): Observable<unknown>;
  abstract saveInvitationCaseScope(
    id: number,
    invitationId: number,
    data: ExpertCaseScopeWrite,
  ): Observable<ExpertWorkspace>;
  abstract invitationAction(
    id: number,
    invitationId: number,
    action: "resend" | "revoke",
  ): Observable<unknown>;
  abstract assignments(id: number, expertId: number): Observable<AssignmentOptions>;
  abstract saveAssignments(
    id: number,
    expertId: number,
    revision: string,
    projectIds: number[],
  ): Observable<AssignmentOptions>;
  abstract allocation(id: number, query: AllocationQuery): Observable<AllocationPlan>;
  abstract applyAllocation(id: number, planToken: string): Observable<ExpertWorkspace>;
  abstract quota(id: number, requiredEvaluators: number): Observable<QuotaPreview>;
  abstract saveQuota(
    id: number,
    requiredEvaluators: number,
    revision: string,
  ): Observable<ExpertWorkspace>;
  abstract invitation(token: string): Observable<ExpertInvitation>;
  abstract accept(token: string): Observable<InvitationAccepted>;
  abstract acceptOwn(id: number): Observable<InvitationAccepted>;
  abstract register(token: string, data: ExpertRegistration): Observable<ExpertRegistered>;
  abstract resetPassword(token: string, email: string): Observable<void>;
}
