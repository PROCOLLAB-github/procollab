/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Observable } from "rxjs";
import { ProgramService } from "@office/program/services/program.service";
import { Program } from "@office/program/models/program.model";

export const ProgramDetailResolver: ResolveFn<Program> = (
  route: ActivatedRouteSnapshot
): Observable<Program> => {
  const programService = inject(ProgramService);

  return programService.getOne(route.params["programId"]);
};
