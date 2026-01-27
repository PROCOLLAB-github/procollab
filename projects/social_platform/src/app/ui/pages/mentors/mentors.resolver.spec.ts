/** @format */

import { TestBed } from "@angular/core/testing";

import { MentorsResolver } from "./mentors.resolver";
import { MemberService } from "projects/social_platform/src/app/api/member/member.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { of } from "rxjs";

describe("MentorsResolver", () => {
  beforeEach(() => {
    const memberSpy = jasmine.createSpyObj("memberSpy", { getMentors: of({}) });

    TestBed.configureTestingModule({
      providers: [{ provide: MemberService, useValue: memberSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      MentorsResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
