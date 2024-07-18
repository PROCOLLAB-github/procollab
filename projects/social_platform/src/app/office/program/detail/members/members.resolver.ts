/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ProgramService } from "@office/program/services/program.service";
import { ApiPagination } from "@models/api-pagination.model";
import { User } from "@auth/models/user.model";

export const ProgramMembersResolver: ResolveFn<ApiPagination<User>> = (
  route: ActivatedRouteSnapshot,
) => {
  const programService = inject(ProgramService);

  return programService.getAllMembers(route.parent?.params["programId"], 0, 20);
};
