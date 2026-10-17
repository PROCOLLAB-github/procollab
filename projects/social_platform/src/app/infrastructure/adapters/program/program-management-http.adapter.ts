/** @format */

import { inject, Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { ApiService } from "@corelib";
import {
  ManagementProjectForm,
  ManagementProjectFormWrite,
} from "@domain/program/program-project-form.model";
import { ProgramManagementRepositoryPort } from "@domain/program/ports/program-management.repository.port";
import {
  ManagementEvaluation,
  ManagementMaterial,
  ManagementMaterialWrite,
  ManagementPage,
  ManagementParticipant,
  ManagementProjectsPage,
  ManagementQuery,
  ManagementSettingsWrite,
  ManagementTeam,
  ProgramManagement,
} from "@domain/program/program-management.model";

@Injectable()
export class ProgramManagementHttpAdapter implements ProgramManagementRepositoryPort {
  private readonly api = inject(ApiService);
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
    return this.api.get<ManagementPage<ManagementParticipant>>(
      `${this.root(id)}/participants/`,
      this.params(q),
    );
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
