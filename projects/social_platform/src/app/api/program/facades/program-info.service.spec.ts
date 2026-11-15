/** @format */

import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, Router } from "@angular/router";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { NavService } from "@api/shared/nav.service";
import { BehaviorSubject } from "rxjs";
import { ProgramInfoService } from "./program-info.service";
import { ProgramMainUIInfoService } from "./ui/program-main-ui-info.service";

describe("Поиск в каталоге программ", () => {
  const query = new BehaviorSubject(convertToParamMap({}));
  const navigate = vi.fn().mockResolvedValue(true);
  const router = { navigate, url: "/office/program/all" };
  let search: ProgramMainUIInfoService["searchForm"]["controls"]["search"];

  beforeEach(() => {
    vi.useFakeTimers();
    query.next(convertToParamMap({}));
    navigate.mockClear();
    router.url = "/office/program/all";
    TestBed.configureTestingModule({
      providers: [
        ProgramInfoService,
        ProgramMainUIInfoService,
        { provide: ActivatedRoute, useValue: { queryParamMap: query.asObservable() } },
        { provide: Router, useValue: router },
        { provide: NavService, useValue: { setNavTitle: vi.fn() } },
        { provide: LoggerService, useValue: { debug: vi.fn() } },
      ],
    });
    search = TestBed.inject(ProgramMainUIInfoService).searchForm.controls.search;
    TestBed.inject(ProgramInfoService).initializationPrograms();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it("восстанавливает запрос из истории и позволяет повторить тот же поиск", () => {
    search.setValue("Первая");
    vi.advanceTimersByTime(300);
    expect(navigate).toHaveBeenCalledTimes(1);
    query.next(convertToParamMap({ search: "Первая" }));
    query.next(convertToParamMap({}));
    expect(search.value).toBe("");
    search.setValue("Первая");
    vi.advanceTimersByTime(300);
    expect(navigate).toHaveBeenCalledTimes(2);
    expect(navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ queryParams: { search: "Первая", offset: null } }),
    );
  });

  it("не стирает новый ввод при переходе на другую страницу и не меняет поиск организатора", () => {
    search.setValue("Новый");
    query.next(convertToParamMap({ offset: "20" }));
    expect(search.value).toBe("Новый");
    router.url = "/office/program/managed";
    vi.advanceTimersByTime(300);
    expect(navigate).not.toHaveBeenCalled();
  });
});
