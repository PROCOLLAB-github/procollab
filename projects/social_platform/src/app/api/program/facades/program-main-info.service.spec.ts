/** @format */

import { HttpParams } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, Router } from "@angular/router";
import { NavService } from "@api/shared/nav.service";
import { Program } from "@domain/program/program.model";
import { ok, fail } from "@domain/shared/result.type";
import { BehaviorSubject, Subject } from "rxjs";
import { ParticipatingProgramUseCase } from "../use-cases/participating-program.use-case";
import { ProgramMainUIInfoService } from "./ui/program-main-ui-info.service";
import { ProgramMainInfoService } from "./program-main-info.service";

describe("Каталог программ", () => {
  const query = new BehaviorSubject(convertToParamMap({}));
  const requests: Subject<any>[] = [];
  const execute = vi.fn((_params: HttpParams, _offset: number, _limit: number) => {
    const request = new Subject<any>();
    requests.push(request);
    return request;
  });
  const navigate = vi.fn().mockResolvedValue(true);
  let service: ProgramMainInfoService;

  beforeEach(() => {
    requests.length = 0;
    execute.mockClear();
    navigate.mockClear();
    query.next(convertToParamMap({}));
    TestBed.configureTestingModule({
      providers: [
        ProgramMainInfoService,
        ProgramMainUIInfoService,
        { provide: ActivatedRoute, useValue: { queryParamMap: query.asObservable() } },
        { provide: Router, useValue: { navigate } },
        { provide: NavService, useValue: { setNavTitle: vi.fn() } },
        { provide: ParticipatingProgramUseCase, useValue: { execute } },
      ],
    });
    service = TestBed.inject(ProgramMainInfoService);
    service.initializationMainPrograms();
  });

  it("показывает свежий ответ, запрашивает поиск и страницу на сервере, игнорируя старый ответ", () => {
    expect(execute).toHaveBeenCalledTimes(1);
    expect(service.loading()).toBe(true);
    query.next(convertToParamMap({ search: "  Первая  ", offset: "20", participating: "true" }));
    expect(execute).toHaveBeenCalledTimes(2);
    const [params, offset, limit] = execute.mock.calls[1];
    expect(params.get("search")).toBe("Первая");
    expect(params.get("participating")).toBe("true");
    expect([offset, limit]).toEqual([20, 20]);
    requests[1].next(ok({ count: 21, results: [{ id: 6, name: "Первая" } as Program] }));
    requests[0].next(ok({ count: 1, results: [{ id: 1, name: "Старое" } as Program] }));
    expect(service.programs()[0].id).toBe(6);
    expect(service.count()).toBe(21);
    expect(service.rangeEnd()).toBe(21);
    expect(service.loading()).toBe(false);
  });

  it("показывает ошибку, повторяет запрос и сбрасывает страницу при смене фильтра", () => {
    requests[0].next(fail({ kind: "unknown" }));
    expect(service.error()).toBe(true);
    service.reload();
    expect(service.loading()).toBe(true);
    requests[1].next(ok({ count: 0, results: [] }));
    expect(service.error()).toBe(false);
    service.onTogglePparticipating();
    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ queryParams: { participating: "true", offset: null } }),
    );
  });
});
