/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Observable } from "rxjs";
import { MembersResult } from "@auth/models/user.model";
import { ProgramService } from "@office/program/services/program.service";

export const ProgramMembersResolver: ResolveFn<MembersResult> = (
  route: ActivatedRouteSnapshot
): Observable<MembersResult> => {
  const programService = inject(ProgramService);

  return programService.getAllMembers(route.parent?.params["programId"], 0, 20);
};
