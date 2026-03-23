/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectsMyResolver } from "./my.resolver";
import { of } from "rxjs";
import { ProjectRepository } from "projects/social_platform/src/app/infrastructure/repository/project/project.repository";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ProjectsMyResolver", () => {
  beforeEach(() => {
    const projectSpy = jasmine.createSpyObj({ getMy: of([]) });

    TestBed.configureTestingModule({
      providers: [{ provide: ProjectRepository, useValue: projectSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectsMyResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
