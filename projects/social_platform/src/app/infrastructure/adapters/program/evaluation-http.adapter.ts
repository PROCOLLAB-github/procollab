/** @format */
import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
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
} from "@domain/program/evaluation-workspace.model";
import { EvaluationRepositoryPort } from "@domain/program/ports/evaluation.repository.port";
@Injectable({ providedIn: "root" })
export class EvaluationHttpAdapter implements EvaluationRepositoryPort {
  private readonly api = inject(ApiService);
  private root(id: number) {
    return `/programs/${id}/management`;
  }
  programs(): Observable<EvaluationPrograms> {
    return this.api.get("/evaluation/programs/");
  }
  workspace(id: number): Observable<ExpertWorkspace> {
    return this.api.get(`${this.root(id)}/experts/`);
  }
  invite(id: number, email: string): Observable<unknown> {
    return this.api.post(`${this.root(id)}/experts/`, { email });
  }
  invitationAction(
    id: number,
    invitationId: number,
    action: "resend" | "revoke",
  ): Observable<unknown> {
    return this.api.post(`${this.root(id)}/expert-invitations/${invitationId}/${action}/`, {});
  }
  assignments(id: number, expertId: number): Observable<AssignmentOptions> {
    return this.api.get(`${this.root(id)}/experts/${expertId}/assignments/`);
  }
  saveAssignments(
    id: number,
    expertId: number,
    revision: string,
    projectIds: number[],
  ): Observable<AssignmentOptions> {
    return this.api.put(`${this.root(id)}/experts/${expertId}/assignments/`, {
      revision,
      projectIds,
    });
  }
  allocation(id: number, query: AllocationQuery): Observable<AllocationPlan> {
    return this.api.post(`${this.root(id)}/expert-allocation/`, query);
  }
  applyAllocation(id: number, planToken: string): Observable<ExpertWorkspace> {
    return this.api.post(`${this.root(id)}/expert-allocation/apply/`, { planToken });
  }
  quota(id: number, requiredEvaluators: number): Observable<QuotaPreview> {
    return this.api.post(`${this.root(id)}/evaluators/`, { requiredEvaluators });
  }
  saveQuota(id: number, requiredEvaluators: number, revision: string): Observable<ExpertWorkspace> {
    return this.api.put(`${this.root(id)}/evaluators/`, { requiredEvaluators, revision });
  }
  invitation(token: string): Observable<ExpertInvitation> {
    return this.api.get(`/evaluation/invitations/${encodeURIComponent(token)}/`);
  }
  accept(token: string): Observable<InvitationAccepted> {
    return this.api.post(`/evaluation/invitations/${encodeURIComponent(token)}/accept/`, {});
  }
  acceptOwn(id: number): Observable<InvitationAccepted> {
    return this.api.post(`/evaluation/own-invitations/${id}/accept/`, {});
  }
  register(token: string, data: ExpertRegistration): Observable<ExpertRegistered> {
    return this.api.post(`/evaluation/invitations/${encodeURIComponent(token)}/register/`, data);
  }
  resetPassword(token: string, email: string): Observable<void> {
    return this.api.post("/auth/reset_password/", { email, expertInvitationToken: token });
  }
}
