/** @format */

import { TestBed } from "@angular/core/testing";
import { ResolveFn } from "@angular/router";

import { skillsListResolver } from "./list.resolver";

describe("listResolver", () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => skillsListResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(executeResolver).toBeTruthy();
  });
});
