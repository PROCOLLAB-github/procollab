/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectDetailResolver } from "./detail.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProjectDetailResolver", () => {
  let resolver: ProjectDetailResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ProjectDetailResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
