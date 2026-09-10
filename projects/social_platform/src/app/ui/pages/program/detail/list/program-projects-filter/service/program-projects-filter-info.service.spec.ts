/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { GetProgramFiltersUseCase } from "@api/program/use-cases/get-program-filters.use-case";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ok } from "@domain/shared/result.type";
import { of } from "rxjs";
import { ProgramProjectsFilterInfoService } from "./program-projects-filter-info.service";

describe("ProgramProjectsFilterInfoService", () => {
  it("loads the program case schema for the expert rating list", () => {
    const execute = vi.fn().mockReturnValue(
      of(
        ok([
          {
            id: 12,
            name: "case_direction",
            label: "Кейс",
            fieldType: "select",
            isRequired: false,
            helpText: "",
            options: ["Мобильное приложение", "Веб-сервис"],
            showFilter: true,
          },
        ]),
      ),
    );
    const route = {
      parent: { snapshot: { params: { programId: "27" } } },
      snapshot: { queryParams: {} },
      queryParams: of({}),
    };

    TestBed.configureTestingModule({
      providers: [
        ProgramProjectsFilterInfoService,
        {
          provide: ProgramDetailListUIInfoService,
          useValue: { listType: signal("rating") },
        },
        { provide: GetProgramFiltersUseCase, useValue: { execute } },
        { provide: ActivatedRoute, useValue: route },
        {
          provide: Router,
          useValue: { url: "/office/program/27/rating", navigate: vi.fn(), navigateByUrl: vi.fn() },
        },
        { provide: LoggerService, useValue: { error: vi.fn(), info: vi.fn() } },
      ],
    });

    const service = TestBed.inject(ProgramProjectsFilterInfoService);
    service.initializationProgramProjectsFilter();

    expect(execute).toHaveBeenCalledExactlyOnceWith(27);
    expect(service.filters()?.[0].label).toBe("Кейс");
    expect(service.filterForm.get("case_direction")).toBeTruthy();
    expect(service.filterForm.get("is_rated_by_expert")).toBeTruthy();
  });
});
