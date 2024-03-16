/** @format */

import { inject } from "@angular/core";
import { MemberService } from "@services/member.service";
import { ResolveFn } from "@angular/router";
import { ApiPagination } from "@models/api-pagination.model";
import { User } from "@auth/models/user.model";

export const MentorsResolver: ResolveFn<ApiPagination<User>> = () => {
  const memberService = inject(MemberService);

  return memberService.getMentors(0, 20);
};
