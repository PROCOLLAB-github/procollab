/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map } from "rxjs";
import { GetMembersUseCase } from "@api/member/use-cases/get-members.use-case";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { User } from "@domain/auth/user.model";

import { normalizeMemberSearch } from "@api/member/member-search";

/** Предзагружает первые 20 участников с тем же поиском, который указан в URL. */
export const MembersResolver: ResolveFn<ApiPagination<User>> = route => {
  const getMembersUseCase = inject(GetMembersUseCase);

  // Загружаем первые 20 участников (skip: 0, take: 20)
  return getMembersUseCase
    .execute(0, 20, { fullname: normalizeMemberSearch(route.queryParams["fullname"]) })
    .pipe(
      map(result =>
        result.ok
          ? result.value
          : {
              count: 0,
              results: [],
              next: "",
              previous: "",
            },
      ),
    );
};
