/** @format */

import { TestBed } from "@angular/core/testing";

import { OfficeResolver } from "./office.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("OfficeResolver", () => {
  let resolver: OfficeResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(OfficeResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
