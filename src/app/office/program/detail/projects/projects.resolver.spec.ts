/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramProjectsResolver } from "./projects.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProjectsResolver", () => {
  let resolver: ProgramProjectsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ProgramProjectsResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
