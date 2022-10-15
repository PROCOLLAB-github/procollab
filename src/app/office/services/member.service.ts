/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "../../core/services";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { User, UserSpeciality } from "../../auth/models/user.model";
import { plainToClass } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class MemberService {
  constructor(private apiService: ApiService) {}

  getMembers(): Observable<User[]> {
    return this.apiService
      .get<User[]>("/members/all")
      .pipe(map(users => plainToClass(User, users)));
  }

  private specialities$ = new BehaviorSubject<UserSpeciality[]>([]);
  specialities = this.specialities$.asObservable();

  getSpecialities(): Observable<UserSpeciality[]> {
    return this.apiService.get<UserSpeciality[]>("/profile/profile_specialities/").pipe(
      // map(specialities => plainToClass(UserSpeciality, specialities)),
      tap(specialities => {
        this.specialities$.next(specialities);
      })
    );
  }
}
