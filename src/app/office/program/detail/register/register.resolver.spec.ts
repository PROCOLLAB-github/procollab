/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramRegisterResolver } from "./register.resolver";

describe("RegisterResolver", () => {
  let resolver: ProgramRegisterResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ProgramRegisterResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
