/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramProjectsResolver } from "./projects.resolver";

describe("ProjectsResolver", () => {
  let resolver: ProgramProjectsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    resolver = TestBed.inject(ProgramProjectsResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
