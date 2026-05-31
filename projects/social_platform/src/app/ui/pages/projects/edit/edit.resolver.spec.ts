/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectEditResolver } from "./edit.resolver";
import { provideRouter, ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from "@angular/router";
import { of } from "rxjs";
import { GetProjectUseCase } from "@api/project/use-cases/get-project.use-case";
import { GetProjectGoalsUseCase } from "@api/project/use-cases/get-project-goals.use-case";
import { GetProjectPartnersUseCase } from "@api/project/use-cases/get-project-partners.use-case";
import { GetProjectResourcesUseCase } from "@api/project/use-cases/get-project-resources.use-case";
import { GetProjectInvitesUseCase } from "@api/invite/use-cases/get-project-invites.use-case";

describe("ProjectEditResolver", () => {
  const mockRoute = {
    paramMap: convertToParamMap({ projectId: 1 }),
  } as unknown as ActivatedRouteSnapshot;

  beforeEach(() => {
    const okResult = (value: any) => of({ ok: true, value });

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: GetProjectUseCase, useValue: { execute: () => okResult({}) } },
        { provide: GetProjectGoalsUseCase, useValue: { execute: () => okResult([]) } },
        { provide: GetProjectPartnersUseCase, useValue: { execute: () => okResult([]) } },
        { provide: GetProjectResourcesUseCase, useValue: { execute: () => okResult([]) } },
        { provide: GetProjectInvitesUseCase, useValue: { execute: () => okResult([]) } },
      ],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectEditResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
