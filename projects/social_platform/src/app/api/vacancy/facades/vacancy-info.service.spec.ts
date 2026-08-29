/** @format */

import { TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import { GetVacanciesUseCase } from "../use-cases/get-vacancies.use-case";
import { VacancyUIInfoService } from "./ui/vacancy-ui-info.service";
import { VacancyInfoService } from "./vacancy-info.service";
import { isSuccess } from "@domain/shared/async-state";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { Vacancy } from "@domain/vacancy/vacancy.model";

describe("VacancyInfoService", () => {
  let service: VacancyInfoService;
  let ui: VacancyUIInfoService;
  let routeData: BehaviorSubject<Record<string, unknown>>;
  let getVacanciesUseCase: any;

  beforeEach(() => {
    routeData = new BehaviorSubject<Record<string, unknown>>({ data: [] });
    getVacanciesUseCase = { execute: vi.fn().mockReturnValue(of({ ok: true, value: [] })) };

    TestBed.configureTestingModule({
      providers: [
        FormBuilder,
        VacancyInfoService,
        VacancyUIInfoService,
        {
          provide: Router,
          useValue: {
            url: "/office/vacancies/my",
            events: new Subject(),
            navigate: vi.fn(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeData.asObservable(),
            queryParams: of({}),
          },
        },
        { provide: GetVacanciesUseCase, useValue: getVacanciesUseCase },
      ],
    });

    service = TestBed.inject(VacancyInfoService);
    ui = TestBed.inject(VacancyUIInfoService);
  });

  it("my route записывает resolver responses в responsesList", () => {
    const response = Object.assign(new VacancyResponse(), { id: 7 });
    routeData.next({ data: [response] });
    ui.listType.set("my");

    service.initializeListData();

    expect(ui.responsesList()).toEqual([response]);
    expect(ui.vacancyList()).toEqual([]);
    expect(ui.isMyModal()).toBe(false);
  });

  it("пустой my response list включает empty-state только после загрузки", () => {
    ui.listType.set("my");

    service.initializeListData();

    expect(ui.responsesList()).toEqual([]);
    expect(ui.isMyModal()).toBe(true);
  });

  it("all route записывает вакансии в vacancies$ и очищает stale responses", () => {
    const vacancy = Object.assign(new Vacancy(), { id: 9 });
    ui.responsesList.set([Object.assign(new VacancyResponse(), { id: 7 })]);
    routeData.next({ data: [vacancy] });
    ui.listType.set("all");

    service.initializeListData();

    expect(isSuccess(ui.vacancies$())).toBe(true);
    expect(ui.vacancyList()).toEqual([vacancy]);
    expect(ui.responsesList()).toEqual([]);
  });

  it("my route не запускает vacancy pagination", () => {
    ui.listType.set("my");
    const target = document.createElement("div");

    service.onScroll(target).subscribe();

    expect(getVacanciesUseCase.execute).not.toHaveBeenCalled();
  });
});
