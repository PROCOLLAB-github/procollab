/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectsAllResolver } from "./all.resolver";
import { of } from "rxjs";
import { ProjectService } from "@services/project.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ProjectsAllResolver", () => {
  beforeEach(() => {
    const projectSpy = jasmine.createSpyObj({ getAll: of([]) });

    TestBed.configureTestingModule({
      providers: [{ provide: ProjectService, useValue: projectSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectsAllResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
