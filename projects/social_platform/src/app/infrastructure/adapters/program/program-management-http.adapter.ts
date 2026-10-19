/** @format */

import { inject, Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import { ProgramResults, ResultsQuery } from "@domain/program/program-results.model";
import {
  ManagementCriteria,
  ManagementCriteriaWrite,
} from "@domain/program/program-criteria.model";
import {
  ManagementProjectForm,
  ManagementProjectFormWrite,
} from "@domain/program/program-project-form.model";
import { ProgramManagementRepositoryPort } from "@domain/program/ports/program-management.repository.port";
import {
  ManagementEvaluation,
  ManagementMaterial,
  ManagementMaterialWrite,
  ManagementParticipantsPage,
  ManagementProjectsPage,
  ManagementQuery,
  ManagementSettingsWrite,
  ManagementTeam,
  ProgramManagement,
} from "@domain/program/program-management.model";

@Injectable()
export class ProgramManagementHttpAdapter implements ProgramManagementRepositoryPort {
  private readonly api = inject(ApiService);
  results(id: number) {
    return this.api.get<ProgramResults>(`${this.root(id)}/results/`);
  }
  exportResults(id: number, query: ResultsQuery) {
    let params = new HttpParams()
      .set("search", query.search)
      .set("case_scope", query.caseScope)
      .set("order", query.order)
      .set("scope", query.scope);
    if (query.caseName) params = params.set("case_name", query.caseName);
    return this.api.getFile(`${this.root(id)}/results/export/`, params);
  }
  criteria(id: number) {
    return this.api.get<ManagementCriteria>(`${this.root(id)}/criteria/`);
  }
  saveCriteria(id: number, body: ManagementCriteriaWrite) {
    return this.api.put<ManagementCriteria>(`${this.root(id)}/criteria/`, body);
  }
  projectForm(id: number) {
    return this.api.get<ManagementProjectForm>(`${this.root(id)}/project-form/`);
  }
  saveProjectForm(id: number, body: ManagementProjectFormWrite) {
    return this.api.put<ManagementProjectForm>(`${this.root(id)}/project-form/`, body);
  }
  private root(id: number): string {
    return `/programs/${id}/management`;
  }
  get(id: number) {
    return this.api.get<ProgramManagement>(`${this.root(id)}/`);
  }
  participants(id: number, q: ManagementQuery) {
    return this.api.get<ManagementParticipantsPage>(
      `${this.root(id)}/participants/`,
      this.participantParams(q),
    );
  }
  exportParticipants(id: number, q: ManagementQuery) {
    return this.api.getFile(`${this.root(id)}/participants/export/`, this.participantParams(q));
  }
  private participantParams(q: ManagementQuery): HttpParams {
    let params = this.params(q)
      .set("region_scope", q.regionScope ?? "all")
      .set("activity", q.activity ?? "all");
    if (q.regionScope === "selected" && q.region) params = params.set("region", q.region);
    if (q.activity === "period") {
      if (q.activityFrom) params = params.set("activity_from", q.activityFrom);
      if (q.activityTo) params = params.set("activity_to", q.activityTo);
    }
    return params;
  }
  projects(id: number, q: ManagementQuery) {
    let params = this.params(q).set("submission", q.submission).set("case_scope", q.caseScope);
    if (q.caseScope === "selected" && q.caseName) params = params.set("case_name", q.caseName);
    return this.api.get<ManagementProjectsPage>(`${this.root(id)}/projects/`, params);
  }
  team(id: number, linkId: number) {
    return this.api.get<ManagementTeam>(`${this.root(id)}/projects/${linkId}/team/`);
  }
  evaluation(id: number, linkId: number) {
    return this.api.get<ManagementEvaluation>(`${this.root(id)}/projects/${linkId}/evaluation/`);
  }
  save(id: number, section: "basic" | "dates", body: ManagementSettingsWrite) {
    return this.api.patch<ProgramManagement>(`${this.root(id)}/settings/${section}/`, body);
  }
  saveMaterial(id: number, body: ManagementMaterialWrite, materialId?: number) {
    return materialId
      ? this.api.patch<ManagementMaterial>(`${this.root(id)}/materials/${materialId}/`, body)
      : this.api.post<ManagementMaterial>(`${this.root(id)}/materials/`, body);
  }
  deleteMaterial(id: number, material: ManagementMaterial) {
    return this.api.delete<void>(
      `${this.root(id)}/materials/${material.id}/`,
      new HttpParams().set("expected_updated_at", material.updatedAt),
    );
  }
  private params(q: ManagementQuery): HttpParams {
    return new HttpParams().set("search", q.search).set("limit", q.limit).set("offset", q.offset);
  }
}
