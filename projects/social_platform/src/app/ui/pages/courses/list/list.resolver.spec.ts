/** @format */

import { TestBed } from "@angular/core/testing";
import { ResolveFn } from "@angular/router";

import { RecordsResolver as listResolver } from "./records.resolver";

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
