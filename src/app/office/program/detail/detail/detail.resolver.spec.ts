/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramDetailResolver } from "./detail.resolver";

describe("DetailResolver", () => {
  let resolver: ProgramDetailResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ProgramDetailResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
