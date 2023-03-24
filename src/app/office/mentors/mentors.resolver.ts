/** @format */

import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { MemberService } from "@services/member.service";
import { User } from "@auth/models/user.model";

@Injectable({
  providedIn: "root",
})
export class MentorsResolver implements Resolve<User[]> {
  constructor(private readonly memberService: MemberService) {}

  resolve(): Observable<User[]> {
    return this.memberService.getMentors();
  }
}
