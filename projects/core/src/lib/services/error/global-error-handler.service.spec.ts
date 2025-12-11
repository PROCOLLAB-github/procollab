/** @format */

import { TestBed } from "@angular/core/testing";

import { GlobalErrorHandlerService } from "../global-error-handler.service";
import { RouterTestingModule } from "@angular/router/testing";

describe("GlobalErrorHandlerService", () => {
  let service: GlobalErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [GlobalErrorHandlerService],
    });
    service = TestBed.inject(GlobalErrorHandlerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
