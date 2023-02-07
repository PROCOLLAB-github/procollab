/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectService } from "./project.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthService } from "@auth/services";

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
