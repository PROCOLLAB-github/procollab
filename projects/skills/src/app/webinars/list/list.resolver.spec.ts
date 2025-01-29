/** @format */

import { TestBed } from "@angular/core/testing";
import { ResolveFn } from "@angular/router";

import { listResolver } from "./records.resolver";

describe("listResolver", () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => listResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(executeResolver).toBeTruthy();
  });
});
