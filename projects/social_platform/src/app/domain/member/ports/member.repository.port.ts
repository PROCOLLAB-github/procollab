/** @format */

import { Observable } from "rxjs";
import { ApiPagination } from "../../other/api-pagination.model";
import { User } from "../../auth/user.model";

export abstract class MemberRepositoryPort {
  abstract getMembers(
    skip: number,
    take: number,
    otherParams?: Record<string, string | number | boolean>
  ): Observable<ApiPagination<User>>;

  abstract getMentors(skip: number, take: number): Observable<ApiPagination<User>>;
}
