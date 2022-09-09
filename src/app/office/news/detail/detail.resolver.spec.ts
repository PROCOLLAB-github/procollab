/** @format */

import { TestBed } from "@angular/core/testing";

import { NewsDetailResolver } from "./detail.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("NewsDetailResolver", () => {
  let resolver: NewsDetailResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    resolver = TestBed.inject(NewsDetailResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
