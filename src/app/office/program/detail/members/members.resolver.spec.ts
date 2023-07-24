/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramMembersResolver } from "./members.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MembersResolver", () => {
  let resolver: ProgramMembersResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ProgramMembersResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
