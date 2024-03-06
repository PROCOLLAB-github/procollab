/** @format */

import { TestBed } from "@angular/core/testing";
import { MembersResolver } from "./members.resolver";
import { MemberService } from "@services/member.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { of } from "rxjs";

describe("MembersResolver", () => {
  beforeEach(() => {
    const memberSpy = jasmine.createSpyObj({ getMembers: of({}) });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: MemberService, useValue: memberSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      MembersResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
