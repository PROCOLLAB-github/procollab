/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectRatingService } from "./project-rating.service";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProjectRatingService", () => {
  let service: ProjectRatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
    });
    service = TestBed.inject(ProjectRatingService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
