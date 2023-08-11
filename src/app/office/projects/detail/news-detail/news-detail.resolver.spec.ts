/** @format */

import { TestBed } from "@angular/core/testing";

import { NewsDetailResolver } from "./news-detail.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("NewsDetailResolver", () => {
  let resolver: NewsDetailResolver;

  beforeEach(() => {
    const projectNewsSpy = jasmine.createSpyObj(["fetchNewsDetail"]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: NewsDetailResolver, useValue: projectNewsSpy }],
    });
    resolver = TestBed.inject(NewsDetailResolver);
  });

  it("should be created", () => {
    expect(resolver).toBeTruthy();
  });
});
