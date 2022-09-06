/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectEditResolver } from "./edit.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("EditResolver", () => {
  let resolver: ProjectEditResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ProjectEditResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
