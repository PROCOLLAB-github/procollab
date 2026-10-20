/** @format */

import { inject, Injectable } from "@angular/core";
import { tap } from "rxjs";
import { ResultsQuery } from "@domain/program/program-results.model";
import { ManagementCriteriaWrite } from "@domain/program/program-criteria.model";
import { ManagementProjectFormWrite } from "@domain/program/program-project-form.model";
import { EventBus } from "@domain/shared/event-bus";
import { ProgramManagementRepositoryPort } from "@domain/program/ports/program-management.repository.port";
import { ProgramManagementHttpAdapter } from "@infrastructure/adapters/program/program-management-http.adapter";
import {
  ManagementMaterial,
  ManagementMaterialWrite,
  ManagementQuery,
  ManagementSettingsWrite,
} from "@domain/program/program-management.model";

/** Приватные manager-данные не попадают в общий EntityCache программы. */
@Injectable()
export class ProgramManagementRepository implements ProgramManagementRepositoryPort {
  private readonly adapter = inject(ProgramManagementHttpAdapter);
  results(id: number) {
    return this.adapter.results(id);
  }
  exportResults(id: number, query: ResultsQuery) {
    return this.adapter.exportResults(id, query);
  }
  private readonly events = inject(EventBus);
  criteria(id: number) {
    return this.adapter.criteria(id);
  }
  saveCriteria(id: number, body: ManagementCriteriaWrite) {
    return this.adapter.saveCriteria(id, body).pipe(tap(() => this.changed(id)));
  }
  projectForm(id: number) {
    return this.adapter.projectForm(id);
  }
  saveProjectForm(id: number, body: ManagementProjectFormWrite) {
    return this.adapter.saveProjectForm(id, body).pipe(tap(() => this.changed(id)));
  }
  get(id: number) {
    return this.adapter.get(id);
  }
  participants(id: number, q: ManagementQuery) {
    return this.adapter.participants(id, q);
  }
  exportParticipants(id: number, q: ManagementQuery) {
    return this.adapter.exportParticipants(id, q);
  }
  selection(id: number, kind: "participants" | "projects", q: ManagementQuery) {
    return this.adapter.selection(id, kind, q);
  }
  exportSelectedParticipants(id: number, ids: number[]) {
    return this.adapter.exportSelectedParticipants(id, ids);
  }
  previewParticipantRemoval(id: number, ids: number[]) {
    return this.adapter.previewParticipantRemoval(id, ids);
  }
  removeParticipants(id: number, ids: number[], previewToken: string) {
    return this.adapter.removeParticipants(id, ids, previewToken).pipe(tap(() => this.changed(id)));
  }
  projects(id: number, q: ManagementQuery) {
    return this.adapter.projects(id, q);
  }
  team(id: number, linkId: number) {
    return this.adapter.team(id, linkId);
  }
  evaluation(id: number, linkId: number) {
    return this.adapter.evaluation(id, linkId);
  }
  save(id: number, section: "basic" | "dates", body: ManagementSettingsWrite) {
    return this.adapter.save(id, section, body).pipe(tap(() => this.changed(id)));
  }
  saveMaterial(id: number, body: ManagementMaterialWrite, materialId?: number) {
    return this.adapter.saveMaterial(id, body, materialId).pipe(tap(() => this.changed(id)));
  }
  deleteMaterial(id: number, material: ManagementMaterial) {
    return this.adapter.deleteMaterial(id, material).pipe(tap(() => this.changed(id)));
  }
  private changed(id: number): void {
    this.events.emit({
      type: "ProgramUpdated",
      payload: { programId: id },
      occurredAt: new Date(),
    });
  }
}
