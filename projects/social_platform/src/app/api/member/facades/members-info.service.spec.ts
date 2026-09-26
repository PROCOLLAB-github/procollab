/** @format */
import { TestBed } from "@angular/core/testing";
import { signal, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import { NavService } from "@api/shared/nav.service";
import { NavigationService } from "@api/paths/navigation.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { GetMembersUseCase } from "../use-cases/get-members.use-case";
import { MembersUIInfoService } from "./ui/members-ui-info.service";
import { MembersInfoService } from "./members-info.service";
import { MembersResolver } from "@ui/pages/members/members.resolver";
import { ok } from "@domain/shared/result.type";
import { normalizeMemberSearch } from "../member-search";

const page = (ids: number[], count = ids.length) => ({
  count,
  next: "",
  previous: "",
  results: ids.map(id => ({ id })),
});

describe("Поиск участников", () => {
  const params = new BehaviorSubject<Record<string, string>>({});
  const execute = vi.fn();
  const navigate = vi.fn();
  let ui: MembersUIInfoService, service: MembersInfoService;
  beforeEach(() => {
    vi.useFakeTimers();
    params.next({ fullname: "  Иван  Иванов " });
    execute.mockReset().mockReturnValue(of(ok(page([1], 1))));
    navigate.mockReset().mockImplementation((_commands, options) => {
      const next = { ...params.value, ...options.queryParams };
      if (!next.fullname) delete next.fullname;
      params.next(next);
      return Promise.resolve(true);
    });
    TestBed.configureTestingModule({
      providers: [
        MembersInfoService,
        MembersUIInfoService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: params.value },
            queryParams: params,
            data: of({ data: page([1, 2], 100) }),
          },
        },
        { provide: Router, useValue: { navigate } },
        { provide: GetMembersUseCase, useValue: { execute } },
        { provide: NavService, useValue: { setNavTitle: vi.fn() } },
        { provide: NavigationService, useValue: {} },
        { provide: LoggerService, useValue: { debug: vi.fn() } },
        { provide: ProfileInfoService, useValue: { profile: signal({ id: 7 }) } },
        {
          provide: ProfileDetailUIInfoService,
          useValue: { profileId: signal(7), applySetLoggedUserId: vi.fn() },
        },
      ],
    });
    ui = TestBed.inject(MembersUIInfoService);
    service = TestBed.inject(MembersInfoService);
    service.initializationMembers();
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });
  it("нормализует пробелы без изменения регистра", () => {
    expect(normalizeMemberSearch("  иВан\t  Иванов  ")).toBe("иВан Иванов");
    expect(normalizeMemberSearch(null)).toBe("");
  });
  it("быстрый ввод отправляет последнюю строку, а очистка возвращает полный список", async () => {
    for (const value of ["И", "Ив", "Ива", "Иван Иванов"]) {
      ui.searchForm.patchValue({ search: value });
      await vi.advanceTimersByTimeAsync(60);
    }
    await vi.advanceTimersByTimeAsync(450);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenLastCalledWith(0, 20, { fullname: "Иван Иванов" });
    expect(ui.membersTotalCount()).toBe(1);
    ui.searchForm.patchValue({ search: "  Иван   Иванов  " });
    await vi.advanceTimersByTimeAsync(450);
    expect(navigate).toHaveBeenCalledTimes(1);
    ui.searchForm.patchValue({ search: null });
    await vi.advanceTimersByTimeAsync(450);
    expect(execute).toHaveBeenLastCalledWith(0, 20, {});
  });
  it("поиск из URL виден в форме, resolver передаёт тот же fullname", () => {
    expect(ui.searchForm.controls.search.value).toBe("Иван Иванов");
    TestBed.runInInjectionContext(() =>
      MembersResolver({ queryParams: params.value } as any, {} as any),
    );
    expect(execute).toHaveBeenCalledWith(0, 20, { fullname: "Иван Иванов" });
  });
  it("сохраняет фильтры и отменяет устаревший поисковый запрос", async () => {
    const old = new Subject<any>();
    execute.mockReturnValueOnce(old);
    params.next({ fullname: "Иван", skills__contains: "SQL" });
    await vi.advanceTimersByTimeAsync(150);
    params.next({ fullname: "Пётр", skills__contains: "SQL" });
    await vi.advanceTimersByTimeAsync(150);
    old.next(ok(page([99])));
    expect(execute).toHaveBeenLastCalledWith(0, 20, { fullname: "Пётр", skills__contains: "SQL" });
    expect(ui.members().map(u => u.id)).toEqual([1]);
  });
  it("поздняя страница старого поиска не дописывается к новому", async () => {
    const old = new Subject<any>();
    execute.mockReturnValueOnce(old);
    const target = document.createElement("div"),
      root = document.createElement("ul");
    service.initScroll(target, new ElementRef(root));
    target.dispatchEvent(new Event("scroll"));
    expect(execute).toHaveBeenCalledWith(2, 20, { fullname: "Иван Иванов" });
    params.next({ fullname: "Анна" });
    await vi.advanceTimersByTimeAsync(150);
    old.next(ok(page([99])));
    old.complete();
    expect(ui.members().map(u => u.id)).toEqual([1]);
  });
});
