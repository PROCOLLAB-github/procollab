/** @format */

import { TestBed } from "@angular/core/testing";
import { ResolveFn } from "@angular/router";

import { TrajectoriesResolver as listResolver } from "../track-career.resolver";

describe("listResolver", () => {
  const executeResolver: ResolveFn<unknown> = () =>
    TestBed.runInInjectionContext(() => listResolver());

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("should be created", () => {
    expect(executeResolver).toBeTruthy();
  });
});
