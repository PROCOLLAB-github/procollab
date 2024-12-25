/** @format */

import { TestBed } from "@angular/core/testing";

import { WebinarService } from "../../../../webinar.service";

describe("WebinarService", () => {
  let service: WebinarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebinarService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
