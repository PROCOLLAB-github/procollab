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

  getMembers(skip: number, take: number): Observable<MembersResult> {
    return this.apiService
      .get<MembersResult>(
        "/auth/users/",
        new HttpParams({ fromObject: { user_type: 1, limit: take, offset: skip } })
      )
      .pipe(map(users => plainToInstance(MembersResult, users)));
  }

  getMentors(): Observable<MembersResult> {
    return this.apiService
      .get<MembersResult>("/auth/users", new HttpParams({ fromObject: { user_type: "2,3,4" } }))
      .pipe(map(users => plainToInstance(MembersResult, users)));
  }
}
