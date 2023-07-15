/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { ProgramsResult } from "@office/program/models/programs-result.model";
import { HttpParams } from "@angular/common/http";
import { ProgramCreate } from "@office/program/models/program-create.model";
import { Program } from "@office/program/models/program.model";

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

  create(program: ProgramCreate): Observable<Program> {
    return this.apiService.post("/programs", program);
  }
}
