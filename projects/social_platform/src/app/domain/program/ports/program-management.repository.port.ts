/** @format */

import { Observable } from "rxjs";
import { ManagementProjectForm, ManagementProjectFormWrite } from "../program-project-form.model";
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
} from "../program-management.model";

export abstract class ProgramManagementRepositoryPort {
  abstract projectForm(programId: number): Observable<ManagementProjectForm>;
  abstract saveProjectForm(
    programId: number,
    body: ManagementProjectFormWrite,
  ): Observable<ManagementProjectForm>;
  abstract get(programId: number): Observable<ProgramManagement>;
  abstract participants(
    programId: number,
    query: ManagementQuery,
  ): Observable<ManagementPage<ManagementParticipant>>;
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
