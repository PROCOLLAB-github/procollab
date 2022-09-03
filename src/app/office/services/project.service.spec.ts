/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectService } from "./project.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProjectService", () => {
  let service: ProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProjectService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
