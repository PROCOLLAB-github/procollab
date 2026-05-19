/** @format */

import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { User } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { MemberRepositoryPort } from "@domain/member/ports/member.repository.port";
import { MemberHttpAdapter } from "../../adapters/member/member-http.adapter";
import { userFromRaw } from "@utils/userRaw";

/** Репозиторий участников: passthrough + `plainToInstance(User)`. */
@Injectable({ providedIn: "root" })
export class MemberRepository implements MemberRepositoryPort {
  private readonly memberAdapter = inject(MemberHttpAdapter);

  getMembers(
    skip: number,
    take: number,
    otherParams?: Record<string, string | number | boolean>
  ): Observable<ApiPagination<User>> {
    return this.memberAdapter.getMembers(skip, take, otherParams).pipe(
      map(result => ({
        ...result,
        results: result.results.map(user => userFromRaw(user)),
      }))
    );
  }
}
