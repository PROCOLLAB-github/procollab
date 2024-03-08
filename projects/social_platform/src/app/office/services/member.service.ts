/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@models/api-pagination.model";
import { User } from "@auth/models/user.model";

@Injectable({
  providedIn: "root",
})
export class MemberService {
  constructor(private readonly apiService: ApiService) {}

  getMembers(
    skip: number,
    take: number,
    otherParams?: Record<string, string | number | boolean>
  ): Observable<ApiPagination<User>> {
    let allParams = new HttpParams({ fromObject: { user_type: 1, limit: take, offset: skip } });
    if (otherParams) {
      allParams = allParams.appendAll(otherParams);
    }
    return this.apiService.get<ApiPagination<User>>("/auth/users/", allParams);
  }

  getMentors(skip: number, take: number): Observable<ApiPagination<User>> {
    return this.apiService.get<ApiPagination<User>>(
      "/auth/users",
      new HttpParams({ fromObject: { user_type: "2,3,4", limit: take, offset: skip } })
    );
  }
}
