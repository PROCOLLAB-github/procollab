/** @format */

import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { ProgramService } from "@office/program/services/program.service";
import { ProgramsResult } from "@office/program/models/programs-result.model";

@Injectable({
  providedIn: "root",
})
export class ProgramMainResolver implements Resolve<ProgramsResult> {
  constructor(private readonly programService: ProgramService) {}

  resolve(): Observable<ProgramsResult> {
    return this.programService.getAll(0, 20);
  }
}
