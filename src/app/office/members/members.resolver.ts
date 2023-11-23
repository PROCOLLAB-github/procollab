/** @format */

import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { MemberService } from "@services/member.service";
import { MembersResult } from "@auth/models/user.model";

@Injectable({
  providedIn: "root",
})
export class MembersResolver  {
  constructor(private readonly memberService: MemberService) {}

  resolve(): Observable<MembersResult> {
    return this.memberService.getMembers(0, 20);
  }
}
