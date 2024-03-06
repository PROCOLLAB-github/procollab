/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramService } from "./program.service";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProgramService", () => {
  let service: ProgramService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
    });
    service = TestBed.inject(ProgramService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
