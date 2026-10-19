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
} from "@domain/program/program-management.model";

@Injectable()
export class ProgramManagementUseCase {
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
  participants(id: number, q: ManagementQuery) {
    return this.repository.participants(id, q);
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
