/** @format */

import { inject } from "@angular/core";
import { MemberService } from "@services/member.service";
import { MembersResult } from "@auth/models/user.model";
import { ResolveFn } from "@angular/router";

export const MembersResolver: ResolveFn<MembersResult> = () => {
  const memberService = inject(MemberService);

  return memberService.getMembers(0, 20);
};
