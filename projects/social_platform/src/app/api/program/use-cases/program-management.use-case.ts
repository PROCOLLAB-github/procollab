/** @format */

import { inject, Injectable } from "@angular/core";
import { ResultsQuery } from "@domain/program/program-results.model";
import { ManagementCriteriaWrite } from "@domain/program/program-criteria.model";
import { ProgramManagementRepositoryPort } from "@domain/program/ports/program-management.repository.port";
import { ManagementProjectFormWrite } from "@domain/program/program-project-form.model";
import {
  ManagementMaterial,
  ManagementMaterialWrite,
  ManagementQuery,
  ManagementSettingsWrite,
  ManagementProjectActionWrite,
} from "@domain/program/program-management.model";

@Injectable()
export class ProgramManagementUseCase {
  previewProjectAction(id: number, body: ManagementProjectActionWrite) {
    return this.repository.previewProjectAction(id, body);
  }
  applyProjectAction(id: number, body: ManagementProjectActionWrite & { previewToken: string }) {
    return this.repository.applyProjectAction(id, body);
  }
  private readonly repository = inject(ProgramManagementRepositoryPort);
  results(id: number) {
    return this.repository.results(id);
  }
  exportResults(id: number, query: ResultsQuery) {
    return this.repository.exportResults(id, query);
  }
  criteria(id: number) {
    return this.repository.criteria(id);
  }
  saveCriteria(id: number, body: ManagementCriteriaWrite) {
    return this.repository.saveCriteria(id, body);
  }
  projectForm(id: number) {
    return this.repository.projectForm(id);
  }
  saveProjectForm(id: number, body: ManagementProjectFormWrite) {
    return this.repository.saveProjectForm(id, body);
  }
  get(id: number) {
    return this.repository.get(id);
  }
  returnToDraft(id: number, expectedUpdatedAt: string) {
    return this.repository.returnToDraft(id, expectedUpdatedAt);
  }
  participants(id: number, q: ManagementQuery) {
    return this.repository.participants(id, q);
  }
  exportProjects(id: number, q: ManagementQuery) {
    return this.repository.exportProjects(id, q);
  }
  exportParticipants(id: number, q: ManagementQuery) {
    return this.repository.exportParticipants(id, q);
  }
  selection(id: number, kind: "participants" | "projects", q: ManagementQuery) {
    return this.repository.selection(id, kind, q);
  }
  exportSelectedParticipants(id: number, ids: number[]) {
    return this.repository.exportSelectedParticipants(id, ids);
  }
  previewParticipantRemoval(id: number, ids: number[]) {
    return this.repository.previewParticipantRemoval(id, ids);
  }
  removeParticipants(id: number, ids: number[], previewToken: string) {
    return this.repository.removeParticipants(id, ids, previewToken);
  }
  projects(id: number, q: ManagementQuery) {
    return this.repository.projects(id, q);
  }
  team(id: number, linkId: number) {
    return this.repository.team(id, linkId);
  }
  evaluation(id: number, linkId: number) {
    return this.repository.evaluation(id, linkId);
  }
  save(id: number, section: "basic" | "dates", body: ManagementSettingsWrite) {
    return this.repository.save(id, section, body);
  }
  saveMaterial(id: number, body: ManagementMaterialWrite, materialId?: number) {
    return this.repository.saveMaterial(id, body, materialId);
  }
  deleteMaterial(id: number, material: ManagementMaterial) {
    return this.repository.deleteMaterial(id, material);
  }
}
