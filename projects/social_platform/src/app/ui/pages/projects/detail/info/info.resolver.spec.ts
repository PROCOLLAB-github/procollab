/** @format */

import { TestBed } from "@angular/core/testing";
import { ProjectInfoResolver } from "./info.resolver";
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot, provideRouter } from "@angular/router";
import { of } from "rxjs";
import { GetVacanciesUseCase } from "@api/vacancy/use-cases/get-vacancies.use-case";

describe("ProjectInfoResolver", () => {
  const mockRoute = {
    paramMap: convertToParamMap({ projectId: 1 }),
  } as unknown as ActivatedRouteSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: GetVacanciesUseCase,
          useValue: { execute: () => of({ ok: true, value: [] }) },
        },
      ],
    });
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() =>
      ProjectInfoResolver(mockRoute, {} as RouterStateSnapshot)
    );
    expect(result).toBeTruthy();
  });
});
