/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectsAllResolver } from "./all.resolver";
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { GetAllProjectsUseCase } from "@api/project/use-cases/get-all-projects.use-case";

describe("ProjectsAllResolver", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: GetAllProjectsUseCase,
          useValue: {
            execute: () =>
              of({
                ok: true,
                value: { count: 0, results: [], next: "", previous: "" },
              }),
          },
        },
      ],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectsAllResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
