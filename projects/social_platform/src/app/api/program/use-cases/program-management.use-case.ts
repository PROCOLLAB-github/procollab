/** @format */

import { inject, Injectable } from "@angular/core";
import { ProgramManagementRepositoryPort } from "@domain/program/ports/program-management.repository.port";
import {
  ManagementMaterial,
  ManagementMaterialWrite,
  ManagementQuery,
  ManagementSettingsWrite,
} from "@domain/program/program-management.model";

@Injectable()
export class ProgramManagementUseCase {
  private readonly repository = inject(ProgramManagementRepositoryPort);
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
