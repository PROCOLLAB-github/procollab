/** @format */

import { TestBed } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { ProjectRepository } from "./project.service";

describe("ProjectRepository", () => {
  let service: ProjectRepository;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj([{ profile: of({}) }]);

    TestBed.configureTestingModule({
      providers: [{ provide: AuthRepository, useValue: authSpy }],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProjectRepository);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
