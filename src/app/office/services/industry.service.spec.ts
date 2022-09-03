/** @format */

import { TestBed } from "@angular/core/testing";

import { IndustryService } from "./industry.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("IndustryService", () => {
  let service: IndustryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(IndustryService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
