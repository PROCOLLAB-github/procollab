/** @format */

import { TestBed } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AdvertService } from "./advert.service";

describe("ArticleService", () => {
  let service: AdvertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AdvertService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
