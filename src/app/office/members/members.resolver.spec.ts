/** @format */

import { TestBed } from "@angular/core/testing";

import { MembersResolver } from "./members.resolver";
import { MemberService } from "@services/member.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MembersResolver", () => {
  let resolver: MembersResolver;

  beforeEach(() => {
    const memberSpy = jasmine.createSpyObj(["getMembers"]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: MemberService, useValue: memberSpy }],
    });
    resolver = TestBed.inject(MembersResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
