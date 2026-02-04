/** @format */

import { TestBed } from "@angular/core/testing";

import { MemberService } from "../member.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MemberService", () => {
  let service: MemberService;

  beforeEach(() => {
    const memberSpy = jasmine.createSpyObj(["getMembers"]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: MemberService, useValue: memberSpy }],
    });
    service = TestBed.inject(MemberService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
