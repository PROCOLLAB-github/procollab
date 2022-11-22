/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { map, Observable } from "rxjs";
import { User } from "../../auth/models/user.model";
import { plainToInstance } from "class-transformer";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class MemberService {
  constructor(private apiService: ApiService) {}

  getMembers(): Observable<User[]> {
    return this.apiService
      .get<User[]>("/auth/users/", new HttpParams({ fromObject: { user_type: 1 } }))
      .pipe(map(users => plainToInstance(User, users)));
  }

  getMentors(): Observable<User[]> {
    return this.apiService
      .get<User[]>("/auth/users", new HttpParams({ fromObject: { user_type: "2,3,4" } }))
      .pipe(map(users => plainToInstance(User, users)));
  }
}
