/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { map, Observable } from "rxjs";
import { ProgramsResult } from "@office/program/models/programs-result.model";
import { HttpParams } from "@angular/common/http";
import { ProgramCreate } from "@office/program/models/program-create.model";
import { Program, ProgramDataSchema } from "@office/program/models/program.model";

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
}
