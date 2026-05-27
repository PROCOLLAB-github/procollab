/** @format */

import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { User } from "@domain/auth/user.model";
import { map } from "rxjs";
import { GetAllMembersUseCase } from "@api/program/use-cases/get-all-members.use-case";

/** Предзагружает первую страницу участников программы. */
export const ProgramMembersResolver: ResolveFn<ApiPagination<User>> = (
  route: ActivatedRouteSnapshot
) => {
  const getAllMembersUseCase = inject(GetAllMembersUseCase);

  return getAllMembersUseCase
    .execute(route.parent?.params["programId"], 0, 20)
    .pipe(
      map(result => (result.ok ? result.value : { count: 0, results: [], next: "", previous: "" }))
    );
};
