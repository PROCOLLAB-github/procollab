/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectResponsesResolver } from "./responses.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ResponsesResolver", () => {
  let resolver: ProjectResponsesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ProjectResponsesResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
