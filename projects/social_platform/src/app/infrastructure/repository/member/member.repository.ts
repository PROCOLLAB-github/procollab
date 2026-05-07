/** @format */

import { inject, Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { map, Observable } from "rxjs";
import { User } from "@domain/auth/user.model";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { MemberRepositoryPort } from "@domain/member/ports/member.repository.port";
import { MemberHttpAdapter } from "../../adapters/member/member-http.adapter";

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
        results: plainToInstance(User, result.results),
      }))
    );
  }

  getMentors(skip: number, take: number): Observable<ApiPagination<User>> {
    return this.memberAdapter.getMentors(skip, take).pipe(
      map(result => ({
        ...result,
        results: plainToInstance(User, result.results),
      }))
    );
  }
}
