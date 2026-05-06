/** @format */

import { Provider } from "@angular/core";
import { MemberRepositoryPort } from "@domain/member/ports/member.repository.port";
import { MemberRepository } from "../repository/member/member.repository";

export const MEMBER_PROVIDERS: Provider[] = [
  { provide: MemberRepositoryPort, useExisting: MemberRepository },
];
