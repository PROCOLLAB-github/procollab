/** @format */

import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { ProgramService } from "@office/program/services/program.service";
import { ProgramsResult } from "@office/program/models/programs-result.model";
import { ResolveFn } from "@angular/router";

export const ProgramMainResolver: ResolveFn<ProgramsResult> = (): Observable<ProgramsResult> => {
  const programService = inject(ProgramService);

  return programService.getAll(0, 20);
};
