/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectsResolver } from "./projects.resolver";
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { GetAllProjectsUseCase } from "@api/project/use-cases/get-all-projects.use-case";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";
import { GetProjectSubscriptionsUseCase } from "@api/project/use-cases/get-project-subscriptions.use-case";

describe("ProjectsResolver", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ProfileInfoService, useValue: { profile: signal(null) } },
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
        {
          provide: GetProjectSubscriptionsUseCase,
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
      ProjectsResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
