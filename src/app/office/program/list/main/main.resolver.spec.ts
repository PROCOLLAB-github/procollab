/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramMainResolver } from "./main.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MainResolver", () => {
  let resolver: ProgramMainResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(ProgramMainResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
