/** @format */

import { Observable } from "rxjs";
import { ProgramResults, ResultsQuery } from "../program-results.model";
import { ManagementCriteria, ManagementCriteriaWrite } from "../program-criteria.model";
import { ManagementProjectForm, ManagementProjectFormWrite } from "../program-project-form.model";
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
  ManagementSelection,
  ParticipantRemovalPreview,
  ManagementProjectActionWrite,
  ManagementProjectActionPreview,
  ManagementProjectActionResult,
} from "../program-management.model";

export abstract class ProgramManagementRepositoryPort {
  abstract previewProjectAction(
    id: number,
    body: ManagementProjectActionWrite,
  ): Observable<ManagementProjectActionPreview>;
  abstract applyProjectAction(
    id: number,
    body: ManagementProjectActionWrite & { previewToken: string },
  ): Observable<ManagementProjectActionResult>;
  abstract results(programId: number): Observable<ProgramResults>;
  abstract exportResults(programId: number, query: ResultsQuery): Observable<Blob>;
  abstract criteria(programId: number): Observable<ManagementCriteria>;
  abstract saveCriteria(
    programId: number,
    body: ManagementCriteriaWrite,
  ): Observable<ManagementCriteria>;
  abstract projectForm(programId: number): Observable<ManagementProjectForm>;
  abstract saveProjectForm(
    programId: number,
    body: ManagementProjectFormWrite,
  ): Observable<ManagementProjectForm>;
  abstract get(programId: number): Observable<ProgramManagement>;
  abstract participants(
    programId: number,
    query: ManagementQuery,
  ): Observable<ManagementParticipantsPage>;
  abstract exportProjects(programId: number, query: ManagementQuery): Observable<Blob>;
  abstract exportParticipants(programId: number, query: ManagementQuery): Observable<Blob>;
  abstract selection(
    programId: number,
    kind: "participants" | "projects",
    query: ManagementQuery,
  ): Observable<ManagementSelection>;
  abstract exportSelectedParticipants(programId: number, ids: number[]): Observable<Blob>;
  abstract previewParticipantRemoval(
    programId: number,
    ids: number[],
  ): Observable<ParticipantRemovalPreview>;
  abstract removeParticipants(
    programId: number,
    ids: number[],
    previewToken: string,
  ): Observable<{ removed: number }>;
  abstract projects(programId: number, query: ManagementQuery): Observable<ManagementProjectsPage>;
  abstract team(programId: number, linkId: number): Observable<ManagementTeam>;
  abstract evaluation(programId: number, linkId: number): Observable<ManagementEvaluation>;
  abstract save(
    programId: number,
    section: "basic" | "dates",
    body: ManagementSettingsWrite,
  ): Observable<ProgramManagement>;
  abstract saveMaterial(
    programId: number,
    body: ManagementMaterialWrite,
    id?: number,
  ): Observable<ManagementMaterial>;
  abstract deleteMaterial(programId: number, material: ManagementMaterial): Observable<void>;
}
