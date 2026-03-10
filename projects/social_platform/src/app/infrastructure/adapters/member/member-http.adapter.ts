/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { User } from "../../../domain/auth/user.model";

@Injectable({ providedIn: "root" })
export class MemberHttpAdapter {
  private readonly AUTH_PUBLIC_USERS_URL = "/auth/public-users";
  private readonly apiService = inject(ApiService);

  getMembers(
    skip: number,
    take: number,
    otherParams?: Record<string, string | number | boolean>
  ): Observable<ApiPagination<User>> {
    let allParams = new HttpParams({ fromObject: { user_type: 1, limit: take, offset: skip } });
    if (otherParams) {
      allParams = allParams.appendAll(otherParams);
    }
    return this.apiService.get<ApiPagination<User>>(`${this.AUTH_PUBLIC_USERS_URL}/`, allParams);
  }

  getMentors(skip: number, take: number): Observable<ApiPagination<User>> {
    return this.apiService.get<ApiPagination<User>>(
      `${this.AUTH_PUBLIC_USERS_URL}/`,
      new HttpParams({ fromObject: { user_type: "2,3,4", limit: take, offset: skip } })
    );
  }
}
