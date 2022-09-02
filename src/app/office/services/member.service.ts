/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { map, Observable } from "rxjs";
import { User } from "../../auth/models/user.model";
import { plainToClass } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class MemberService {
  constructor(private apiService: ApiService) {}

  getMembers(): Observable<User[]> {
    return this.apiService.get<User[]>("/member/all").pipe(map(users => plainToClass(User, users)));
  }
}
