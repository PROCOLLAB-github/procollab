/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { map, Observable } from "rxjs";
import { MembersResult } from "@auth/models/user.model";
import { plainToInstance } from "class-transformer";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class MemberService {
  constructor(private readonly apiService: ApiService) {}

  getMembers(
    skip: number,
    take: number,
    otherParams?: Record<string, string | number | boolean>
  ): Observable<MembersResult> {
    let allParams = new HttpParams({ fromObject: { user_type: 1, limit: take, offset: skip } });
    if (otherParams) {
      allParams = allParams.appendAll(otherParams);
    }
    return this.apiService
      .get<MembersResult>("/auth/users/", allParams)
      .pipe(map(users => plainToInstance(MembersResult, users)));
  }

  getMentors(skip: number, take: number): Observable<MembersResult> {
    return this.apiService
      .get<MembersResult>(
        "/auth/users",
        new HttpParams({ fromObject: { user_type: "2,3,4", limit: take, offset: skip } })
      )
      .pipe(map(users => plainToInstance(MembersResult, users)));
  }
}
