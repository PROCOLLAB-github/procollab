/** @format */

import { TestBed } from "@angular/core/testing";

import { NewsAllResolver } from "./all.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("NewsAllResolver", () => {
  let resolver: NewsAllResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(NewsAllResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
