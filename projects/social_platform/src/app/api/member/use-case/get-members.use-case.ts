/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { User } from "../../../domain/auth/user.model";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { MemberRepositoryPort } from "../../../domain/member/ports/member.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class GetMembersUseCase {
  private readonly memberRepositoryPort = inject(MemberRepositoryPort);

  execute(
    skip: number,
    take: number,
    params?: Record<string, string | number | boolean>
  ): Observable<Result<ApiPagination<User>, { kind: "get_members_error"; cause?: unknown }>> {
    return this.memberRepositoryPort.getMembers(skip, take, params).pipe(
      map(members => ok<ApiPagination<User>>(members)),
      catchError(error => of(fail({ kind: "get_members_error" as const, cause: error })))
    );
  }
}
