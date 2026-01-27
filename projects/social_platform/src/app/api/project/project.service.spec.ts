/** @format */

import { TestBed } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "../auth";
import { ProjectService } from "./project.service";

describe("ProjectService", () => {
  let service: ProjectService;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj([{ profile: of({}) }]);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authSpy }],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProjectService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
