/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectsMyResolver } from "./my.resolver";
import { of } from "rxjs";
import { ProjectService } from "@services/project.service";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

describe("ProjectsMyResolver", () => {
  beforeEach(() => {
    const projectSpy = jasmine.createSpyObj({ getMy: of([]) });

    TestBed.configureTestingModule({
      providers: [{ provide: ProjectService, useValue: projectSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectsMyResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
