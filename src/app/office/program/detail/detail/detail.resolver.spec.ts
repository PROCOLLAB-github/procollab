/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramDetailResolver } from "./detail.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("DetailResolver", () => {
  let resolver: ProgramDetailResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ProgramDetailResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
