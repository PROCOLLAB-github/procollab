/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { ProgramsResult } from "@office/program/models/programs-result.model";
import { HttpParams } from "@angular/common/http";
import { ProgramCreate } from "@office/program/models/program-create.model";
import { Program, ProgramDataSchema, ProgramTag } from "@office/program/models/program.model";
import { Project } from "@models/project.model";
import { ApiPagination } from "@models/api-pagination.model";
import { User } from "@auth/models/user.model";

@Injectable({
  providedIn: "root",
})
export class ProgramService {
  constructor(private readonly apiService: ApiService) {}

  getAll(skip: number, take: number): Observable<ProgramsResult> {
    return this.apiService.get(
      "/programs/",
      new HttpParams({ fromObject: { limit: take, offset: skip } })
    );
  }

  getOne(programId: number): Observable<Program> {
    return this.apiService.get(`/programs/${programId}/`);
  }

  create(program: ProgramCreate): Observable<Program> {
    return this.apiService.post("/programs/", program);
  }

  getDataSchema(programId: number): Observable<ProgramDataSchema> {
    return this.apiService
      .get<{ dataSchema: ProgramDataSchema }>(`/programs/${programId}/schema/`)
      .pipe(map(r => r["dataSchema"]));
  }

  register(
    programId: number,
    additionalData: Record<string, string>
  ): Observable<ProgramDataSchema> {
    return this.apiService.post(`/programs/${programId}/register/`, additionalData);
  }

  getAllProjects(
    programId: number,
    offset: number,
    limit: number
  ): Observable<ApiPagination<Project>> {
    return this.apiService.get(
      `/projects/`,
      new HttpParams({ fromObject: { partner_program: programId, offset, limit } })
    );
  }

  getAllMembers(programId: number, skip: number, take: number): Observable<ApiPagination<User>> {
    return this.apiService.get(
      "/auth/users/",
      new HttpParams({ fromObject: { partner_program: programId, limit: take, offset: skip } })
    );
  }

  programTags$ = new BehaviorSubject<ProgramTag[]>([]);
  programTags(): Observable<ProgramTag[]> {
    return this.apiService.get<ProgramTag[]>("/auth/users/current/programs/tags/").pipe(
      tap(programs => {
        this.programTags$.next(programs);
      })
    );
  }
}
