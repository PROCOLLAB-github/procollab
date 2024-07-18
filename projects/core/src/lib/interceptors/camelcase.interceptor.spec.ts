/** @format */

import { TestBed } from "@angular/core/testing";

import { CamelcaseInterceptor } from "./camelcase.interceptor";

describe("CamelcaseInterceptor", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [CamelcaseInterceptor],
    }),
  );

  it("should be created", () => {
    const interceptor: CamelcaseInterceptor = TestBed.inject(CamelcaseInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
