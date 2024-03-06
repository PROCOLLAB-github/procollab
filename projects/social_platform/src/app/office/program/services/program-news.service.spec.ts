/** @format */

import { TestBed } from "@angular/core/testing";

import { ProgramNewsService } from "./program-news.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProgramNewsService", () => {
  let service: ProgramNewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProgramNewsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
