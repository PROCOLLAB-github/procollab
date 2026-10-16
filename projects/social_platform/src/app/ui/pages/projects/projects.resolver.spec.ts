/** @format */

import { TestBed } from "@angular/core/testing";
import { DashboardProjectsData, ProjectsResolver } from "./projects.resolver";
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { Observable, of } from "rxjs";
import { User } from "@domain/auth/user.model";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { GetAllProjectsUseCase } from "@api/project/use-cases/get-all-projects.use-case";
import { GetMyProjectsUseCase } from "@api/project/use-cases/get-my-projects.use-case";
import { GetProjectSubscriptionsUseCase } from "@api/project/use-cases/get-project-subscriptions.use-case";

describe("ProjectsResolver", () => {
  const profile = signal<User | null>(null);
  const ensureProfileLoaded = vi.fn();
  beforeEach(() => {
    profile.set(null);
    ensureProfileLoaded.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ProfileInfoService, useValue: { profile, ensureProfileLoaded } },
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

  it("waits for the loaded user on a direct visit and completes after one snapshot", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectsResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<DashboardProjectsData>;
    const next = vi.fn();
    const complete = vi.fn();
    result.subscribe({ next, complete });
    TestBed.flushEffects();
    expect(ensureProfileLoaded).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalled();
    profile.set({ id: 1 } as User);
    TestBed.flushEffects();
    expect(next).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledOnce();
    profile.set({ id: 2 } as User);
    TestBed.flushEffects();
    expect(next).toHaveBeenCalledOnce();
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectsResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
