/** @format */

import { TestBed } from "@angular/core/testing";

import { MentorsResolver } from "./mentors.resolver";
import { MemberService } from "@services/member.service";

describe("MembersResolver", () => {
  let resolver: MentorsResolver;

  beforeEach(() => {
    const memberSpy = jasmine.createSpyObj(["getMembers"]);

    TestBed.configureTestingModule({
      providers: [{ provide: MemberService, useValue: memberSpy }],
    });
    resolver = TestBed.inject(MentorsResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
