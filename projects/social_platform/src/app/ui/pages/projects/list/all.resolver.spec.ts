/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectsAllResolver } from "./all.resolver";
import { of } from "rxjs";
import { ProjectRepository } from "projects/social_platform/src/app/infrastructure/repository/project/project.repository";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ProjectsAllResolver", () => {
  beforeEach(() => {
    const projectSpy = jasmine.createSpyObj({ getAll: of([]) });

    TestBed.configureTestingModule({
      providers: [{ provide: ProjectRepository, useValue: projectSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectsAllResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
