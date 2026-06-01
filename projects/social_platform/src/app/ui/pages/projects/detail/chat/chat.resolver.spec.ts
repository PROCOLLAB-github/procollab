/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectChatResolver } from "./chat.resolver";
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  RouterStateSnapshot,
  provideRouter,
} from "@angular/router";
import { of } from "rxjs";
import { GetProjectUseCase } from "@api/project/use-cases/get-project.use-case";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";

describe("ProjectChatResolver", () => {
  const mockRoute = {
    parent: { paramMap: convertToParamMap({ projectId: 1 }) },
  } as unknown as ActivatedRouteSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: GetProjectUseCase,
          useValue: { execute: () => of({ ok: true, value: {} }) },
        },
        {
          provide: ProjectsDetailUIInfoService,
          useValue: { applySetProject: jasmine.createSpy("applySetProject") },
        },
      ],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectChatResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
