/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramMainResolver } from "./main.resolver";

describe("MainResolver", () => {
  let resolver: ProgramMainResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ProgramMainResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
