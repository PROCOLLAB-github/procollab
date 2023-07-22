/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramMembersResolver } from "./members.resolver";

describe("MembersResolver", () => {
  let resolver: ProgramMembersResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ProgramMembersResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
