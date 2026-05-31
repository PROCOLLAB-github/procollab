/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectsMyResolver } from "./my.resolver";
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";

describe("ProjectsMyResolver", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: GetMyProjectsUseCase,
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
      ProjectsMyResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
