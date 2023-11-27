/** @format */

import { TestBed } from "@angular/core/testing";

import { ProjectResponsesResolver } from "./responses.resolver";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { VacancyService } from "@office/services/vacancy.service";
import { ActivatedRouteSnapshot, convertToParamMap, RouterStateSnapshot } from "@angular/router";
import { of } from "rxjs";

describe("ProjectResponsesResolver", () => {
  const mockRoute = {
    parent: { paramMap: convertToParamMap({ projectId: 1 }) },
  } as unknown as ActivatedRouteSnapshot;
  beforeEach(() => {
    const vacancySpy = jasmine.createSpyObj("vacancyService", { responsesByProject: of({}) });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: VacancyService, useValue: vacancySpy }],
    });
    TestBed.inject(VacancyService);
  });

  it("should be created", () => {
    const result = TestBed.runInInjectionContext(() => {
      return ProjectResponsesResolver(mockRoute, {} as RouterStateSnapshot);
    });
    expect(result).toBeTruthy();
  });
});
