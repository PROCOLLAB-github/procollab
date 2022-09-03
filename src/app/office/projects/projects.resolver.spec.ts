/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectsResolver } from "./projects.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProjectsResolver", () => {
  let resolver: ProjectsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ProjectsResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
