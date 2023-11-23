/** @format */

import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { MemberService } from "@services/member.service";
import { MembersResult } from "@auth/models/user.model";

@Injectable({
  providedIn: "root",
})
export class MentorsResolver  {
  constructor(private readonly memberService: MemberService) {}

  resolve(): Observable<MembersResult> {
    return this.memberService.getMentors(0, 20);
  }
}
