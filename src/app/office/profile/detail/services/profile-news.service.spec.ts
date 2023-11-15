/** @format */

import { TestBed } from "@angular/core/testing";

import { ProfileNewsService } from "./profile-news.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProfileNewsService", () => {
  let service: ProfileNewsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProfileNewsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
