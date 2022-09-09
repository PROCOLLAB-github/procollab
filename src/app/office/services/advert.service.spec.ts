/** @format */

import { TestBed } from "@angular/core/testing";

import { AdvertSerivce } from "./advert.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ArticleService", () => {
  let service: AdvertSerivce;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AdvertSerivce);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
