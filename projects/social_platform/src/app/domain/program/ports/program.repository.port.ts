/** @format */

import { HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { Program, ProgramDataSchema } from "../program.model";
import { ProgramCreate } from "../program-create.model";
import { Project } from "../../project/project.model";
import { User } from "../../auth/user.model";
import { PartnerProgramFields } from "../partner-program-fields.model";
import { ProjectAdditionalFields } from "../../project/project-additional-fields.model";

export abstract class ProgramRepositoryPort {
  abstract getAll(
    skip: number,
    take: number,
    params?: HttpParams
  ): Observable<ApiPagination<Program>>;

  abstract getActualPrograms(): Observable<ApiPagination<Program>>;

  abstract getOne(programId: number): Observable<Program>;

  abstract create(program: ProgramCreate): Observable<Program>;

  abstract getDataSchema(programId: number): Observable<ProgramDataSchema>;

  abstract register(
    programId: number,
    additionalData: Record<string, string>
  ): Observable<ProgramDataSchema>;

  abstract getAllProjects(
    programId: number,
    params?: HttpParams
  ): Observable<ApiPagination<Project>>;

  abstract getAllMembers(
    programId: number,
    skip: number,
    take: number
  ): Observable<ApiPagination<User>>;

  abstract getProgramFilters(programId: number): Observable<PartnerProgramFields[]>;

  abstract getProgramProjectAdditionalFields(
    programId: number
  ): Observable<ProjectAdditionalFields>;

  abstract applyProjectToProgram(programId: number, body: any): Observable<any>;

  abstract createProgramFilters(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams
  ): Observable<ApiPagination<Project>>;

  abstract submitCompettetiveProject(relationId: number): Observable<Project>;
}
