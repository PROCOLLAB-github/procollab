/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectChatResolver } from "./chat.resolver";
import { ProjectService } from "@services/project.service";
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from "@angular/router";
import { of } from "rxjs";

describe("ProjectChatResolver", () => {
  const mockRoute = {
    parent: { paramMap: convertToParamMap({ projectId: 1 }) },
  } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    const projectSpy = jasmine.createSpyObj({ getOne: of({}) });

    TestBed.configureTestingModule({
      providers: [{ provide: ProjectService, useValue: projectSpy }],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectChatResolver(mockRoute, {} as RouterStateSnapshot),
    );
    expect(result).toBeTruthy();
  });
});
