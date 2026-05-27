/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { User } from "@domain/auth/user.model";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { Program, ProgramDataSchema } from "@domain/program/program.model";
import { ProgramCreate } from "@domain/program/program-create.model";
import { Project } from "@domain/project/project.model";
import { ProjectAdditionalFields } from "@domain/project/project-additional-fields.model";
import { ApplyToProgramDTO } from "@domain/program/dto/apply-to-program.model";
import { ApplyToProgramResponse } from "@domain/program/results/apply-to-program";

/** HTTP-адаптер программ: `/programs`, `/auth/public-users` (детали, проекты, участники, фильтры, регистрация). */
@Injectable({ providedIn: "root" })
export class ProgramHttpAdapter {
  private readonly PROGRAMS_URL = "/programs";
  private readonly AUTH_PUBLIC_USERS_URL = "/auth/public-users";
  private readonly apiService = inject(ApiService);

  getAll(skip: number, take: number, params?: HttpParams): Observable<ApiPagination<Program>> {
    let httpParams = new HttpParams().set("limit", take).set("offset", skip);

    if (params) {
      params.keys().forEach(key => {
        const value = params.get(key);
        if (value !== null) {
          httpParams = httpParams.set(key, value);
        }
      });
    }

    return this.apiService.get(`${this.PROGRAMS_URL}/`, httpParams);
  }

  getOne(programId: number): Observable<Program> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/`);
  }

  create(program: ProgramCreate): Observable<Program> {
    return this.apiService.post(`${this.PROGRAMS_URL}/`, program);
  }

  getDataSchema(programId: number): Observable<{ dataSchema: ProgramDataSchema }> {
    return this.apiService.get<{ dataSchema: ProgramDataSchema }>(
      `${this.PROGRAMS_URL}/${programId}/schema/`
    );
  }

  register(
    programId: number,
    additionalData: Record<string, string>
  ): Observable<ProgramDataSchema> {
    return this.apiService.post(`${this.PROGRAMS_URL}/${programId}/register/`, additionalData);
  }

  getAllProjects(programId: number, params?: HttpParams): Observable<ApiPagination<Project>> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/projects/`, params);
  }

  getAllMembers(programId: number, skip: number, take: number): Observable<ApiPagination<User>> {
    return this.apiService.get(
      `${this.AUTH_PUBLIC_USERS_URL}/`,
      new HttpParams({ fromObject: { partner_program: programId, limit: take, offset: skip } })
    );
  }

  getProgramFilters(programId: number): Observable<PartnerProgramFields[]> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/filters/`);
  }

  getProgramProjectAdditionalFields(programId: number): Observable<ProjectAdditionalFields> {
    return this.apiService.get(`${this.PROGRAMS_URL}/${programId}/projects/apply/`);
  }

  applyProjectToProgram(
    programId: number,
    dto: ApplyToProgramDTO
  ): Observable<ApplyToProgramResponse> {
    const payload = {
      project: dto.project,
      program_field_values: dto.programFieldValues.map(({ fieldId, valueText }) => ({
        field_id: fieldId,
        value_text: valueText,
      })),
    };
    return this.apiService.post(`${this.PROGRAMS_URL}/${programId}/projects/apply/`, payload);
  }

  createProgramFilters(
    programId: number,
    filters: Record<string, string[]>,
    params?: HttpParams
  ): Observable<ApiPagination<Project>> {
    let url = `${this.PROGRAMS_URL}/${programId}/projects/filter/`;
    if (params) {
      url += `?${params.toString()}`;
    }
    return this.apiService.post(url, { filters });
  }

  submitCompettetiveProject(relationId: number): Observable<Project> {
    return this.apiService.post(
      `${this.PROGRAMS_URL}/partner-program-projects/${relationId}/submit/`,
      {}
    );
  }
}
