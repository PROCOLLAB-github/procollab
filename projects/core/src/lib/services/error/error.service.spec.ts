/** @format */

import { TestBed } from "@angular/core/testing";

import { RouterTestingModule } from "@angular/router/testing";
import { ErrorService } from "../error.service";

describe("ErrorService", () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
    service = TestBed.inject(ErrorService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
